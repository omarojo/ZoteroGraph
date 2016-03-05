$().ready(function(){
    var holder = document.getElementById('holder'),
        state = document.getElementById('status'),
        allWrapper = document.getElementById('entireWebsiteContainer');

    if (typeof window.FileReader === 'undefined') {
      state.className = 'fail';
    } else {
      state.className = 'success';
      state.innerHTML = 'Drag and Drop your Report';
    }

    allWrapper.ondragover = function () { holder.className = 'hover'; return false; };
    allWrapper.ondragend = function () { holder.className = ''; return false; };
    allWrapper.ondrop = function (e) {
      this.className = '';
      e.preventDefault();

      var file = e.dataTransfer.files[0],
          reader = new FileReader();
      reader.onload = function (event) {
        console.log(event.target);
        //holder.style.background = 'url(' + event.target.result + ') no-repeat center';
        generateGraphJSON(event.target.result);
      };
      console.log(file);
      reader.readAsText(file);

      return false;
    };

    function generateGraphJSON(theHTMLReport){
      var json = { nodes : [], links : [], errors: []};
      var referenceCounter = 0;
      var span = document.createElement('span');
      span.innerHTML = ['<p>', theHTMLReport, '</p>'].join('');
      //document.getElementById('list').insertBefore(span, null);
      var report = $(span);
      //console.log(report.html());

      report.find('ul[class="report combineChildItems"]').find('li[class*="item"]').each(function(index, element){
        var reference = {};

        var rId = $(element).attr('id').split("-")[1];
        var rTitle = $(element).children().first().text();
        var metaData = $(element).find("tr");

        reference.id = rId;
        reference.name = rTitle;
        reference.author = [];
        //Add all other properties
        metaData.each(function(index,row){
          var th = $(row).find("th").html(); //property name (key)
          var td = $(row).find("td").html(); //value

          var th_array = th.split(" ");
          //var td_array = td.split(" ");

          var th = th_array[th_array.length -1].toLowerCase();
          //var td = td_array[td_array.length -1].toLowerCase();

          var key = th;

          if(td != null || td != ""){
            if(key == 'author') {
              reference[key].push(td);
            }
            else if(key == 'date'){
              // console.log(td);
              reference[key] = td; //we want both formats of the date
              var unixtime = Date.parse(td).getTime()/1000;
              td = unixtime;
              reference['unixtime'] = td;
            }
            else {
              reference[key] = td;
            }

          }
        });

        reference.tags = [];
        //Create Tags
        var tagsUL = $(element).find('ul[tags="tags"]');
        tagsUL.children().each(function(index,relObject){
          //console.log($(relObject));
          reference.tags.push($(relObject).text());

        });

        //Create Links/Edges
        var relatedItems = $(element).find('ul > li[id|="related"]'); // > li[id|="related"]
        relatedItems.each(function(index,relObject){

          // console.log($(relObject).html());

          var link = {};
          link.source_id = rId;
          link.source = referenceCounter;//rId;
          var tempIdArray = $(relObject).attr('id').split("-");
          link.target_id= tempIdArray[1];
          link.target = null;//$(relObject).attr('id');
          link.title = $(relObject).text();
          json.links.push(link);

        });
        referenceCounter++

        json.nodes.push(reference);
      });
        //Assigning indexes to the links
        json.links.forEach(function(link, iL){
          json.nodes.forEach(function(node, iN){
            if(node.id == link.target_id){
              link.target = iN;
            }
          });
        });
        //Clean nulls
        var tempLinks = [];
        json.links.forEach(function(link, iL){
          if(link.target != null){
            tempLinks.push(link);
          }else{
            json.errors.push(link);
          }
        });
        json.links = tempLinks;

        //console.log(JSON.stringify(json, null, 4));

        //Start the ThreeJs script
        initGraph(JSON.stringify(json, null, 4));

    }


});
