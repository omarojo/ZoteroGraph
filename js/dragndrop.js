$().ready(function() {
  var holder = document.getElementById("holder"),
    state = document.getElementById("status"),
    allWrapper = document.getElementById("entireWebsiteContainer");

  if (typeof window.FileReader === "undefined") {
    state.className = "fail";
  } else {
    state.className = "success";
    state.innerHTML = "Drag and Drop your Report";
  }

  allWrapper.ondragover = function() {
    holder.className = "hover";
    return false;
  };
  allWrapper.ondragend = function() {
    holder.className = "";
    return false;
  };
  allWrapper.ondrop = function(e) {
    this.className = "";
    e.preventDefault();

    var file = e.dataTransfer.files[0],
      reader = new FileReader();
    reader.onload = function(event) {
      console.log(event.target);
      //holder.style.background = 'url(' + event.target.result + ') no-repeat center';
      generateGraphJSON(event.target.result);
    };
    console.log(file);
    reader.readAsText(file);

    return false;
  };

  function generateGraphJSON(theHTMLReport) {
    var json = { categories: {}, nodes: [], links: [], errors: [] };
    var referenceCounter = 0;
    var span = document.createElement("span");
    span.innerHTML = ["<p>", theHTMLReport, "</p>"].join("");
    //document.getElementById('list').insertBefore(span, null);
    var report = $(span);
    //console.log(report.html());

    //Defaults values for Categories
    json.categories = { A: [], B: [], C: [], D: [] };

    report
      .find('ul[class="report combineChildItems"]')
      .find('li[class*="item"]')
      .each(function(index, element) {
        var reference = {};

        var rId = $(element)
          .attr("id")
          .split("_")[1];
        var rTitle = $(element)
          .children()
          .first()
          .text();
        var metaData = $(element).find("tr");

        reference.id = rId;
        reference.name = rTitle;
        reference.author = [];
        //Add all other properties
        metaData.each(function(index, row) {
          var th = $(row)
            .find("th")
            .html(); //property name (key)
          var td = $(row)
            .find("td")
            .html(); //value

          var th_array = th.split(" ");
          //var td_array = td.split(" ");

          var th = th_array[th_array.length - 1].toLowerCase();
          //var td = td_array[td_array.length -1].toLowerCase();

          var key = th;

          if (td != null || td != "") {
            if (key == "author") {
              reference[key].push(td);
            } else if (key == "date") {
              // console.log(td);
              reference[key] = td; //we want both formats of the date
              var unixtime = Date.parse(td).getTime() / 1000;
              td = unixtime;
              reference["unixtime"] = td;
            } else {
              reference[key] = td;
            }
          }
        });

        reference.tags = [];
        reference.categories = { A: "-", B: "-", C: "-", D: "-" }; //Defaults
        //Create Tags and Categories
        console.log(reference.name);
        var tagsUL = $(element).find('ul[class*="tags"]');
        tagsUL.children().each(function(index, relObject) {
          //console.log($(relObject));
          //Save values for the reference
          var cat = $(relObject).text();
          reference.tags.push($(relObject).text());
          var cKey = cat.substring(0, 1); //ie. A

          if (cKey != "A" && cKey != "B" && cKey != "C" && cKey != "D") {
            return; //Is probably the Tags in the "Notes" property that we dont care i.e. _RSImport
          }
          var cValue = cat.substring(3, cat.length); //ie Psychology
          reference.categories[cKey] = cValue;
          //Save Global Categories
          console.log(cKey);
          var isInCategorie = json.categories[cKey].indexOf(cValue) > -1; //true if the value is already in the array of Categories
          if (isInCategorie == false && cValue != "-") {
            //dont save the category if its -
            json.categories[cKey].push(cValue); //save it
          }
        });

        //Create Links/Edges
        var relatedItems = $(element).find('ul[class="related"] > li'); // > li[id|="related"]
        relatedItems.each(function(index, relObject) {
          // console.log($(relObject).html());

          var link = {};
          link.source_id = rId;
          link.source = referenceCounter; //rId;
          var tempIdArray = $(relObject)
            .attr("id")
            .split("_");
          link.target_id = tempIdArray[1];
          link.target = null; //$(relObject).attr('id');
          link.title = $(relObject).text();
          json.links.push(link);
        });
        referenceCounter++;

        json.nodes.push(reference);
      });
    //Assigning indexes to the links
    json.links.forEach(function(link, iL) {
      json.nodes.forEach(function(node, iN) {
        if (node.id == link.target_id) {
          link.target = iN;
        }
      });
    });
    //Clean nulls
    var tempLinks = [];
    json.links.forEach(function(link, iL) {
      if (link.target != null) {
        tempLinks.push(link);
      } else {
        json.errors.push(link);
      }
    });
    json.links = tempLinks;

    //console.log(JSON.stringify(json, null, 4));
    //Check it Url has de command to download the Json file
    let fullUrl = new URL(window.location.href);
    let paramsString = fullUrl.search.slice(1); //slice 1 to rmove the ? sign
    var searchParams = new URLSearchParams(paramsString);

    if (searchParams.has("json") === true) {
      console.log(">> DOWNLOADING JSON FILE");
      downloadJSONFile(JSON.stringify(json, null, 4));
    }

    //Start the ThreeJs script
    initGraph(JSON.stringify(json, null, 4));
  }
  function downloadJSONFile(jsonObject) {
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:application/json;charset=utf-8," + encodeURIComponent(jsonObject)
    );
    element.setAttribute("download", "report.json"); //report is the name of the file to be generate, report.json

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
});
