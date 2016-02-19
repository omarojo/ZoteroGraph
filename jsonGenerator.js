var fs = require('fs');
var cheerio = require('cheerio');
require('datejs');

var $ = cheerio.load(fs.readFileSync('take4.html'));

var title, release, rating;
var json = { nodes : [], links : [], errors: []};

var minYear = 100000;

var list = [];
var i = 0;
$('ul[class="report combineChildItems"]').find('li[class*="item"]').each(function (index, element) {
  var reference = {};



  var rId = $(element).attr('id').split("-")[1];
  var rTitle = $(element).children().first().text();
  var metaData = $(element).find("tr");

  reference.id = rId;
  reference.name = rTitle;

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
      reference[key] = td;
      if(key == 'date'){
        // console.log(td);
        var unixtime = Date.parse(td).getTime()/1000;
        td = unixtime;
        reference['unixtime'] = td;
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
  	link.source = i;//rId;
    var tempIdArray = $(relObject).attr('id').split("-");
    link.target_id= tempIdArray[1];
  	link.target = null;//$(relObject).attr('id');
    link.title = $(relObject).text();
  	json.links.push(link);

  });
  i++

  json.nodes.push(reference);

});

//Assing indexes to the links
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


console.log(minYear);
// var iL = 0;
// for(var link in json['links']){
//   var iN = 0;
//   for(var node in json['nodes']){
//     // console.log("Comparing: "+ node );//+ " with " + link);
//     if(node.id == link.target_id){
//       json.links[iL].target = iN;
//     }
//     iN++;
//   }
//   iL++;
// }


// console.log(json);

fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){

    console.log('File successfully written! - Check your project directory for the output.json file');

})
