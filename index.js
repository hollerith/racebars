var Data = [];

var Item = function(item, index){
  return {
    "$type": "g",
    "class": "bar",
    "$has": [
      {
        "$type": "rect",
        "width": `${Math.abs(item.total/100)}`,
        "height": "19",
        "y": `${index*20}`
      },
      {
        "$type": "text",
        "x": `${Math.abs(item.total/100)+2}`,
        "y": `${(index*20)+10}`,
        "dy": ".35em",
        "$text": `${item.total} ${item.name}`
      }
    ]
  }
}

function render(chart){
  chart.$has = [...Data[chart._step].items.map(Item), ...[legend] ] ;
}

async function load(){

  let response = await fetch('data.csv');
  let text = await response.text();
  let csv = ParseCSV(text); 
  csv.shift(0);

  let ids = [];
  let items = [];
  let id;
  
  for (let [key, name, value] of csv) {
    //console.log(`${key} = ${name} : ${value}`);
    if (key) {
        if (!ids.includes(key)) {
          ids.push(key);
          if (items.length) {
            Data.push({"id": id, "items": items })
            items = [];
          }
          id = key;
        }
        items.push({ "name": name, "total": value });
    }
  }
  Data.push({"id": id, "items": items });

  race();
}

async function race(){
  var legend = document.querySelector('#legend-text1');
  var chart = document.querySelector('#chart');
  if (chart && chart._step < Data.length-1) {
    chart._step++;
    legend.$has = [legendbox, legendtext()];
    chart.$update();
    setTimeout(race, 500);
  }
}

const legendbox = {
  "$type": "rect",
  "id": "legend-background",
  "class": "legendbox",
  "x": "0",
  "y": "0",
  "width": "80",
  "height": "40"
}

const legendtext = () => {
  var chart = document.querySelector('#chart'); 
  if (chart) {
    var step = 1800 + chart._step;
  } else {
    var step = "";
  }

  return {
    "$type": "text",
    "id": "legend-text1",
    "class": "legendtext",
    "x": "10",
    "y": "30",
    "$text": step
  }    
}

var legend = {
  "id": "legend",
  "$type": "g",
  "xmlns": "http://www.w3.org/2000/svg",
  "transform": "translate(1024, 400)",
  "$has": [legendbox, legendtext()],
}

var root = {
  "id": "root",
  "$type": "figure",
  "$cell": true,
  "$has": [
    {
      "$type": "figcaption",
      "$text": "Fruit Bar-chart race"
    },
    {
      "id": "chart",
      "$type": "svg",
      "$cell": true,
      "class": "chart",
      "width": "1200",
      "height": "700",
      "role": "img",
      "$has": [legend],
      "_step": -1,
      "$init": function(){
        load();
      },
      "$update": function(){
        render(this);
      },
    }
  ]
}
