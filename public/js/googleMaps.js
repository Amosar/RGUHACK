const api_key = "AIzaSyD8ojhxXumuuDx3Tsx_WmxYy8mQDEEFqD0";
let markers = [];


/*
 * Use Google Maps Geolocation API to found the location of the user.
 * It use information about cell towers and WiFi nodes and it's not precise.
 * @param success - give a callback method called if the user location is get.
*/

function getQuickLocation(success) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            const geolocation = JSON.parse(xhttp.responseText).location;
            if (xhttp.readyState === 4 && (xhttp.status === 403 || xhttp.status === 500)) {
                el.innerHTML += 'Sorry! Our Google Geolocation API Quota exceeded. Maybe refresh the page to try again.';
            }
            success(geolocation);
        }
    };
    xhttp.open("POST", "https://www.googleapis.com/geolocation/v1/geolocate?key=" + api_key, true);
    xhttp.send();
}


/*
 * Use GPS information to found location
 * @param success - give a callback method called if the user location is get.
*/

function getPreciseLocation(success) {
    const options = {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0
    };

    function localSuccess(pos) {
        const location = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
        };
        success(location);
        $(".location-loading").hide();
    }

    //TODO better error for user
    function localError(err) {
        console.warn(err);
        alert("Your location could not be determined\n" + err.message);
        $(".location-loading").hide();
    }

    navigator.geolocation.getCurrentPosition(localSuccess, localError, options);
    $(".location-loading").show();
}


/*
 * Use user inputed text to find location
 * @param success - give a callback method called if the user location is get.
*/

function searchLocation(success){
  //create the search box and link it to the searchbar
  var input = document.getElementById('searchbar');
  var searchBox = new google.maps.places.SearchBox(input);

    //bias search results to current view
    map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

       //listen for event when user selects place get more information
       searchBox.addListener('places_changed', function() {
         var places = searchBox.getPlaces();

         if (places.length == 0) {
           return;
         }

         //for each place get name and location.
          var bounds = new google.maps.LatLngBounds();
          places.forEach(function(place) {
            //get the center co-ords of the map
            var newMapCenter = map.getCenter();
            if (!place.geometry) {
              console.log("Returned place contains no geometry");
              return;
            }

            if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport);
              //get lat and lng co-ords from center function
              console.log("lat:" + newMapCenter.lat() + " " + "lng:" + newMapCenter.lng());
            } else {
              bounds.extend(place.geometry.location);
              //get lat and lng co-ords from center function
              console.log("lat:" + newMapCenter.lat() + " " + "lng:" + newMapCenter.lng());
            }
          });

          //clear previous markers
          clearMarkers();
          //display the location
          map.fitBounds(bounds);
          //display new markers
          navigatedLocation();
        });
}


/*
 * Update the map with a given location
 * @param location - location object with lat and lng fields.
*/

//when user navigates to a location update markers
function navigatedLocation(location) {
  var newMapCenter = map.getCenter();
  location = {
    lat: newMapCenter.lat(),
    lng: newMapCenter.lng()
  };
    const mapOptions = {
        center: location,
        streetViewControl: false,
        minZoom: 3
    };
    clearMarkers();
    if (typeof map.setCenter !== "undefined") {
        map.panTo(location);
        map.setZoom(mapOptions.zoom);
        placeMarkers(location);
    } else {
        map = new google.maps.Map(document.getElementById('mapId'), mapOptions);
        placeMarkers(location);
    }
}


/*
 * Update the map with a given location
 * @param location - location object with lat and lng fields.
*/

function updateMap(location) {
    const mapOptions = {
        center: location,
        zoom: 15,
        streetViewControl: false,
        minZoom: 3
    };
    clearMarkers();
    if (typeof map.setCenter !== "undefined") {
        map.panTo(location);
        map.setZoom(mapOptions.zoom);
        placeMarkers(location);
    } else {
        map = new google.maps.Map(document.getElementById('map'), mapOptions);
        placeMarkers(location);
    }
}


/*
 * Place marker on the map at given location
 * @param location - location object with lat and lng fields
*/

function placeMarkers(location) {
    const request = {
        location: location,
        radius: '1000',
        type: ['bar']
    };
    const infowindow = new google.maps.InfoWindow();
    const service = new google.maps.places.PlacesService(map);

    service.nearbySearch(request, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < results.length; i++) {
                const place = results[i];

                const icon = {
                    url: "img/pinpint.png",
                    size: new google.maps.Size(50, 50),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(50, 50)
                };
                const marker = new google.maps.Marker({
                    map: map,
                    position: place.geometry.location,
                    icon: icon
                });
                marker.data = place;
                google.maps.event.addListener(marker, 'click', function () {

                    const PlaceService = new google.maps.places.PlacesService(map);
                    PlaceService.getDetails({
                        placeId: this.data.place_id
                    }, function (placeDetail, status) {
                        for (let j = 0; j < markers.length; j++) {
                            if (markers[j].data.place_id === placeDetail.place_id) {
                                if (status === google.maps.places.PlacesServiceStatus.OK) {
                                    infowindow.setContent('<div><strong>' + placeDetail.name + '</strong><br>' +
                                        'Google rating: ' + placeDetail.rating + '<br>' +
                                        'WebSite: <a href="' + placeDetail.website + '" target="_blank">click here</a><br>' +
                                        placeDetail.formatted_address + '</div>');
                                    infowindow.open(map, markers[j]);
                                }
                            }
                        }
                    });
                });
                markers.push(marker);
            }
        }

    });
}


/*
 * Remove all created markers
*/

function clearMarkers() {
    const length = markers.length;
    for (let i = 0; i < length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}


/*
 * Init the map when the page is load
*/

$(document).ready(function () {
    //find location
    getQuickLocation(updateMap);

    //find exact location
    $(".closetome").click(function () {
        $('.search').val(""); //clears the serachbox
        getPreciseLocation(updateMap);
    });

    //find searched location
    $(".search").click(function () {
        searchLocation();
    });

    //add markers for current view on map
    $(".findbars").click(function () {
        navigatedLocation();
    });

});
