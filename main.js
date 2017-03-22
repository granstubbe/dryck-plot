//https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218
//http://bl.ocks.org/weiglemc/6185069

//var data;
var nodes = [];
var APK = 0; //APK = Alcohol Per Krona, variable for switching "currency"
d3.csv("data.csv", function(d) {
  return {
    name : d.Kvittonamn,
    price: +d.Pris,
    type : d.Varugrupp,
    sales : +d.AntalSålda,
    volume : +d.Volym,
    alkohol : +d.Alkoholhalt,
    apk : +d.APK
    
  };
}, function(data) {
    //data = d;
    //init();
    //  
//All types of data
var types = d3.map(data, function(d){return d.type;}).keys()

// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 100},
    width = 960 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;


// set the canvas
var svg = d3.select("body").append("svg")
    .attr("width", width + 200 + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 10)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//X-axis
var x = d3.scaleLog()
          .range([0, width])
          .domain([5,100000]),
    xValue = function(d) { return d.price;}, // data -> value          
    xMap = function(d) {
        if(!APK){  
            return x(d.price);
        }else{
            if(d.alkohol == 0){
                return 0;
            }else{
                return x(d.apk);
            }
        }
    };
    
    
// Gridlines in x axis function
function xAxis() {		
    return d3.axisBottom(x)
             .tickSize(-height)
             .tickFormat("")
        
}

  // Add the X gridlines
  svg.append("g")			
     .attr("class", "grid")
     .attr("id","xgrid")
     .attr("transform", "translate(0," + height + ")")
     .call(xAxis());
  

 // Add the X Axis
  svg.append("g")
     .attr("class", "xaxis")
     .attr("transform", "translate(0," + (height + 5) + ")")
     .call(d3.axisBottom(x)
             .ticks(10,",")
      );   
    
 //Label for the x axis
  svg.append("text")
     .attr("id","xlabel")             
     .attr("transform","translate(" + (width/2) + " ," + 
                           (height + margin.top + 15) + ")")
     .style("text-anchor", "middle")
     .text("Pris [kr]");
      
      
//Y-axis
var y = d3.scaleLog()
          .range([height, 0])
          .domain([1, 20000000]),  
    
    yMap = function(d) { return y(d.sales);}    

// Gridlines in y axis function
function yAxis() {		
    return d3.axisLeft(y)
             .tickSize(-width)
             .tickFormat("")
}

// add the Y gridlines
  svg.append("g")			
     .attr("class", "grid")
     .attr("id","ygrid")
     .call(yAxis());
          
      

// add the Y Axis
  svg.append("g")
     .attr("class","yaxis")
     .call(d3.axisLeft(y)
            .ticks(10,",")
      );
      
      
//Label for the y axis
svg.append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", -80)
    .attr("x",-height/2)
    .attr("dy", ".71em")
    .style("text-anchor", "middle")
    .text("Antal sålda");  
      
      
// Setup fill color
var cValue = function(d) { return d.type;},
    color = d3.scaleOrdinal(d3.schemeCategory20);
    
//Add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

//Add switch-buttons
var button_text = [{name:"APK", value:1},{name:"Pris",value:0}];
var button = svg.selectAll(".button")
                .data(button_text)
                .enter().append("g")
                .attr("class", "button")
                .attr("transform", function(d, i) { return "translate(" + (30 + i * 55) +",20)"; })
                .on("click", function (e) {
                    APK = e.value;
                    console.log(APK);
                    updateAxis();
                    updateTooltip;
                });
  
  //Draw colored rectangles around buttons
  button.append("rect")
          .attr("x", width+2)
          .attr("width", 50)
          .attr("height", 25)
          .style("fill", "#999999");

  //Draw button text
  button.append("text")
          .attr("id","button")
          .attr("x", width+14)
          .attr("y", 12)
          .attr("fill","white")
          .attr("font-size","14")
          .attr("font-family","Tahoma")
          .attr("dy", ".35em")    
          .style("cursor","pointer")       
          .text(function(d) { return d.name;});
      
    var buttonText = d3.select("body").append("div")
                .attr("class","legendTitle")
                .style("left", (width + 114 + "px"))
                .style("top", (30 + "px"))
                .html("Växla mellan APK och Pris");


  
    //Draw legend
    var legend = svg.selectAll(".legend")
                    .data(types)
                    .enter().append("g")
                    .attr("class", "legend")
                    .attr("transform", function(d, i) { return "translate(0," + (80+i * 23) +")"; })
                    .on("click", function (e) {
                        updateNodes(e);
                        //d3.select(this).style("opacity", 0.8);
                    });
  
  //Draw colored rectangles for legends
  legend.append("rect")
          .attr("x", width+2)
          .attr("width", 17)
          .attr("height", 17)
          .style("fill", color)
          .style("cursor","pointer");

  // Draw legend text
  legend.append("text")
          .attr("x", width + 30)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("cursor","pointer")      
          .text(function(d) { return d;});
     
    
    var legendText = d3.select("body").append("div")
                        .attr("class","legendTitle")
                        .style("left", (width + 114 + "px"))
                        .style("top", (85 + "px"))
                        .html("Klicka nedan för att visa/dölja");

//Update nodes in graph  
function updateNodes(type){
    
  //Check if nodes are to be updated or added    
  var extracted = nodes.filter(function(d) {return d.type!=type;});  
  
  if(extracted.length != nodes.length){
        nodes = extracted;
      
  }else{  
        var toAdd = data.filter(function(d) { return d.type==type;});  
            
            toAdd.forEach(function(d){
            nodes.push(d)
            });        
  }
    
  //Create all dots in graph  
  var dots = svg.selectAll(".dot").data(nodes);  
  
  updateAxis(); 
  dots.exit().remove();  
  
  dots = dots
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function(d) { return color(cValue(d));})
        .style("opacity", function(d){
            if(xMap(d)==0){ 
                return 0;
            }else{
                return 1;
            }})
        .merge(dots);
   
   updateTooltip();
     
    
} 

//Updates X-axis
function updateAxis(){
    //Check which setting and adapt axis parameters
    if(APK){
        nodes = nodes.filter(function(d) {return d.alkohol!=0;});
        svg.selectAll(".dot").data(nodes).exit().remove();
        x = d3.scaleLog().range([10, (width-10)])
                .domain([
                        d3.min(nodes,function (d) { return d.apk; }),
                        d3.max(nodes,function (d) { return d.apk; })
                        ])
        d3.select("#xlabel").text("Alkohol per krona [ml/kr]");
    }else{
        x = d3.scaleLog().range([0, width]).domain([5,100000]);
        d3.select("#xlabel").text("Pris [kr]");
    }
    
    // update the X-axis gridlines
  svg.select("#xgrid")
      .transition()
      .duration(400)			
      .call(xAxis());


// update the X Axis
  svg.select(".xaxis")
      .transition()
      .duration(400)
      .call(d3.axisBottom(x)
            .ticks(10,",")
      );

// Update dot positions    
    d3.selectAll('circle') 
          .transition().duration(1000)
          .attr('cx',xMap)
          .attr('cy',yMap)
          .style("opacity", function(d){
                if(xMap(d)==0){ 
                    return 0;
                }else{
                    return 1;
                }});    
    }
    
//Update tooltip    
function updateTooltip(){
svg.selectAll(".dot").data(nodes).on("mouseover", function(d) {
          tooltip.transition()
               .duration(400)
               .style("opacity", .9);
          tooltip.html(d.name + "<br\>"+ d.type + "<br\>"+ d3.format(",")(d.price) + "kr" + "<br\>"+ d3.format(",")(Math.floor(d.sales)) + " antal sålda" + "<br\>"+ d.alkohol)
               .style("left", (xMap(d) + 120) + "px")
               .style("top", (yMap(d)) + "px");
          
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
    });


}         
});
