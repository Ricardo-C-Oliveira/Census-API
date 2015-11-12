$(document).ready(function() {

  var map = L.map('map').setView([39.739800, -104.911276], 11);

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  var sdk = new CitySDK();
  var censusModule = sdk.modules.census;

  censusModule.enable("167f4feb0783bfd976b7839f5037f56119ab3caf")

  //Displays the loading image
  function loadingOn() {
      $('#loading').css('display', 'block');
  }

  //Hides the loading image
  function loadingOff() {
      $('#loading').css('display', 'none');
  }


  var layer = new L.geoJson();
  var dataArray = [];
  $("#add").click(function() {
    loadingOn();
    var option = $("select").children(":selected").attr("id");
    var selected = $("select option:selected").text();

    var request = {
      "state": "CO",
      "sublevel": true,
      "level": "county",
      "variables": [
        option
      ]
    };
    map.removeLayer(layer);
    var callback = function(data) {
      if (dataArray.length != 0){
        dataArray = [];
      };
      for (i = 0; i < data.features.length; i++) {
        dataArray.push(data.features[i].properties[option])
      }
      console.log(dataArray);
      var dataArrayInt = dataArray.map(Number);
      var jenks = ss.ckmeans(dataArrayInt, 6);
      console.log(dataArray.length);
      console.log(jenks);

      function getColor(d) {
        return d < ss.min(jenks[0]) ? '#ffffd9' :
          d < ss.min(jenks[1]) ? '#edf8b1' :
          d < ss.min(jenks[2]) ? '#c7e9b4' :
          d < ss.min(jenks[3]) ? '#7fcdbb' :
          d < ss.min(jenks[4]) ? '#41b6c4' :
          d < ss.max(jenks[5]) ? '#1d91c0' :
          '#1d91c0';
      };

      function style(feature) {
        return {
          weight: 5,
          fillColor: getColor(feature.properties[option]),
          color: '#171795',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.7,
          dashArray: 3,
        };
      };

      layer = L.geoJson(data, {
        style: style,
        onEachFeature: function(feature, layer) {
          layer.bindPopup('Tract Name: ' + feature.properties.name + '<br> ' +
            selected + ': ' +feature.properties[option]);
        },
      }).addTo(map);
      for (i = 0; i < data.features.length; i++) {
        dataArray.push(data.features[i].properties[option])
      }

      $('#leg01').html(' ');
      $('#leg01').html('<span style="background:#ffffd9;"></span>' + ss.min(jenks[0]) + ' - ' + (ss.min(jenks[1]) - 1));

      $('#leg02').html(' ');
      $('#leg02').html('<span style="background:#edf8b1;"></span>' + ss.min(jenks[1]) + ' - ' + (ss.min(jenks[2]) - 1));

      $('#leg03').html(' ');
      $('#leg03').html('<span style="background:#c7e9b4;"></span>' + ss.min(jenks[2]) + ' - ' + (ss.min(jenks[3]) - 1));

      $('#leg04').html(' ');
      $('#leg04').html('<span style="background:#7fcdbb;"></span>' + ss.min(jenks[3]) + ' - ' + (ss.min(jenks[4]) - 1));

      $('#leg05').html(' ');
      $('#leg05').html('<span style="background:#41b6c4;"></span>' + ss.min(jenks[4]) + ' - ' + (ss.min(jenks[5]) - 1));

      $('#leg06').html(' ');
      $('#leg06').html('<span style="background:#1d91c0;"></span>' + ss.min(jenks[5]) + ' - ' + ss.max(jenks[5]));
      loadingOff();
    };
    censusModule.GEORequest(request, callback);
  });
});
