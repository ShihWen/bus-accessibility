mapboxgl.accessToken = 'pk.eyJ1Ijoic2hpaHdlbnd1dHciLCJhIjoiY2poZTMweWFzMHFqMjMwcGMxODB4ZnF2NSJ9.Z26UldBScU4ycC75f24TnA';

let map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/shihwenwutw/ck1myebc70e851co3unmss075', // stylesheet location
    center: [121.55244833917465, 25.03793365035355], // starting position [lng, lat]
    zoom: 12,
    minZoom: 11.5, //10.75
    maxZoom: 14 // starting zoom
});
let nav = new mapboxgl.NavigationControl();

map.addControl(nav, 'bottom-right');
map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
}), 'bottom-right');

//Station layer
const source_layer = 'stationWithNum_v0715';
const source_url = "mapbox://" + "shihwenwutw.75dnta76"
//Route layer
const source_layer_2 = 'shape_all';
const source_url_2 = "mapbox://" + 'shihwenwutwbeta.4eypgwq2' //'shihwenwutw.8sy1nqh1' //'shihwenwutw.9qewrzda'



//HOVER related
// Target the relevant span tags in the station info div
let stationDisplay = document.getElementById('station');
let routeDisplay = document.getElementById('routes');

//FILTER related
// Holds visible features for filtering
let stations = [];
let routes = [];

// Create a popup, but don't add it to the map yet.
let popup = new mapboxgl.Popup({
    closeButton: false
});

let filterEl = document.getElementById('feature-filter');
let listingEl = document.getElementById('feature-listing');
let checkBoxEl = document.getElementById('exact');

//selected feature
let value = '';
let filtered = [];
let all_id = [];
let filt_id = [];
let res = [];

let filtered_r = [];
let all_id_r = [];
let filt_id_r = [];
let res_r = [];
// iso only
let filt_id_r_on = [];
let filt_id_r_off = [];

//clicked feature
let access = [];
let click = false;

//match type
let exactMatch = document.getElementsByName('matchAnswer')[0].checked;

//direction feature
let direction_button = false;

//features by moveend
let features = [];
let features_routes = [];


//Isochrone relared
var iso_slider = document.getElementById("isoRange");
var iso_checkBox = document.getElementById("isoBox");
var output = document.getElementById("time");

function sortChildren(containerSelector, reverse) {
    const container = document.querySelector(containerSelector);
    const order = reverse ? -1 : 1;

    Array.from(container.children)
        .sort((a, b) => order * parseInt(a.dataset.position, 10) - order * parseInt(b.dataset.position, 10))
        .forEach(element => container.appendChild(element));

    // Note you could also conditionally use Array.reverse() instead of the order variable.
}
let edgeEndId = null;
let edgeStartId = null;
function renderListings(features) {
    // Clear any existing listings
    listingEl.innerHTML = '';
    if (radios[0].checked){
        if(edgeEndId){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: edgeEndId
            }, {
                edge: false
            });
        }
        if(edgeStartId){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: edgeStartId
            }, {
                edge: false
            });
        }
        edgeEndId = null;
        edgeStartId = null;
        filteredOnRoutes.forEach(function(feature) {
            let stopSeq = '';
            let prop = feature.properties;
            let stopInfo = prop[value].replace(/"|\[|\]/g,'')
            let item = document.createElement('p');
            let stopMax = ''

            item.textContent = prop.station;


            stopInfo.split(',').forEach(function(item){
                if(item[0]==='0'){
                    stopSeq = item.split('-')[1]
                    stopMax = item.split('-')[2]

                }
            });
            if(stopMax === stopSeq){
                edgeEndId = feature.id;
            }

            if(stopSeq === '1'){
                edgeStartId = feature.id;
            }


            item.setAttribute('data-position', stopSeq);
            item.insertAdjacentHTML('beforeend', `<span class="sideList">${stopSeq}</span>`);

            item.addEventListener('mouseover', function() {
                // Highlight corresponding feature on the map
                popup.setLngLat(feature.geometry.coordinates)
                    .setText(feature.properties.station + ' : ' + feature.properties.routes.replace(/"|\[|\]/g,'').replace(/,/g,', '))
                    .addTo(map);
            });

            item.addEventListener('mouseleave',function(){
                popup.remove();
            });

            listingEl.appendChild(item);

        });

        //sortfilter
        sortChildren('#feature-listing',false);
        // Show the filter input
        //filterEl.parentNode.style.display = 'block';
        if(edgeEndId){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: edgeEndId
            }, {
                edge: true
            });
        }
        if(edgeStartId){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: edgeStartId
            }, {
                edge: true
            });
        }


    } else if (radios[1].checked) {

        if(edgeEndId){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: edgeEndId
            }, {
                edge: false
            });
        }
        if(edgeStartId){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: edgeStartId
            }, {
                edge: false
            });
        }
        edgeEndId = null;
        edgeStartId = null;

        filteredOnRoutes.forEach(function(feature) {
            let stopSeq = '';
            let prop = feature.properties;
            let stopInfo = prop[value].replace(/"|\[|\]/g,'')
            let item = document.createElement('p');
            item.textContent = prop.station;


            stopInfo.split(',').forEach(function(item){
                if(item[0]==='1'){
                    stopSeq = item.split('-')[1]
                    stopMax = item.split('-')[2]
                }
            });
            if(stopMax === stopSeq){
                edgeEndId = feature.id;
            }
            if(stopSeq === '1'){
                edgeStartId = feature.id;
            }


            item.setAttribute('data-position', stopSeq);
            item.insertAdjacentHTML('beforeend', `<span class="sideList">${stopSeq}</span>`);

            item.addEventListener('mouseover', function() {
                // Highlight corresponding feature on the map
                popup.setLngLat(feature.geometry.coordinates)
                    .setText(feature.properties.station + ' : ' + feature.properties.routes.replace(/"|\[|\]/g,'').replace(/,/g,', '))
                    .addTo(map);
            });

            item.addEventListener('mouseleave',function(){
                popup.remove();
            });

            listingEl.appendChild(item);

        });

        //sortfilter
        sortChildren('#feature-listing',false);
        // Show the filter input
        //filterEl.parentNode.style.display = 'block';


        if(edgeEndId){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: edgeEndId
            }, {
                edge: true
            });
        }
        if(edgeStartId){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: edgeStartId
            }, {
                edge: true
            });
        }

    } else if (features.length) {

        features.forEach(function(feature) {
            let prop = feature.properties;
            let item = document.createElement('p');
            item.textContent = prop.station;

            //item.insertAdjacentHTML('beforeend', '<span>'+)
            item.addEventListener('mouseover', function() {
                // Highlight corresponding feature on the map
                popup.setLngLat(feature.geometry.coordinates)
                    .setText(feature.properties.station + ' : ' + feature.properties.routes.replace(/"|\[|\]/g,'').replace(/,/g,', '))
                    .addTo(map);
            });

            item.addEventListener('mouseleave',function(){
                popup.remove();
            });


            listingEl.appendChild(item);
        });

        if(edgeEndId){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: edgeEndId
            }, {
                edge: false
            });
        }
        if(edgeStartId){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: edgeStartId
            }, {
                edge: false
            });
        }

        // Show the filter input
        filterEl.parentNode.style.display = 'block';
    } else {
        let empty = document.createElement('p');
        empty.textContent = 'No results, drag or change words to populate.';
        listingEl.appendChild(empty);

        // remove features filter
        map.setFilter('station-access', ['has', 'routes']);


        if(edgeEndId){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: edgeEndId
            }, {
                edge: false
            });
        }
        if(edgeStartId){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: edgeStartId
            }, {
                edge: false
            });

        }
        edgeEndId = null;
        edgeStartId = null;
    }
}

function normalize(string) {
    return string.trim().toUpperCase();
}


//Update Station Feature
function featureUpdates(value, filtered_input){
    if(value){
        // Filter visible features that don't match the input value.
        filtered_input = stations.filter(function(feature) {
            let routes = normalize(feature.properties.routes);
            let station = normalize(feature.properties.station);

            if(exactMatch){
                return value in feature.properties || value === station;
            } else {
                return routes.indexOf(value) > -1 || station.indexOf(value) > -1;
            }

        });
        renderListings(filtered_input);
        filtered_input.forEach(function(feature){
            filt_id.push(feature.id);
        });
        filt_id = [... new Set(filt_id)];
        res = all_id.filter( function(n) { return !this.has(n) }, new Set(filt_id) );

        filt_id.forEach(function(id){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: id
            }, {
                select: true
            });
        });

        res.forEach(function(id){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: id
            }, {
                select: false
            });
        });
    } else {
        all_id.forEach(function(id){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: id
            }, {
                select: false
            });
        });
    }
};

//Update Route Feature
function featureUpdates_r(value, filtered_input){
    if(value){
        // Filter visible features that don't match the input value.
        filtered_input = routes.filter(function(feature) {
            if(exactMatch){
                return value === feature.properties.RouteNameZ;
            } else {
                let routes = normalize(feature.properties.RouteNameZ);
                return routes.indexOf(value) > -1;
            }
        });

        //renderListings(filtered);
        filtered_input.forEach(function(feature){
            filt_id_r.push(feature.id);
        });

        filt_id_r = [... new Set(filt_id_r)];
        res_r = all_id_r.filter( function(n) { return !this.has(n) }, new Set(filt_id_r) );
        filt_id_r.forEach(function(id){
            map.setFeatureState({
                source: 'routes',
                sourceLayer: source_layer_2,
                id: id
            }, {
                select: true
            });
        });

        res_r.forEach(function(id){
            map.setFeatureState({
                source: 'routes',
                sourceLayer: source_layer_2,
                id: id
            }, {
                select: false
            });
        });
    } else {
        all_id_r.forEach(function(id){
            map.setFeatureState({
                source: 'routes',
                sourceLayer: source_layer_2,
                id: id
            }, {
                select: false
            });
        });
    }
};

//Gether feature id on the map with corresponding routes
let renderListing_click = [];
function featureUpdates_click_id(value, filteredInputPoint, filteredInputLine){

    //Station
    filteredInputPoint = stations.filter(function(feature) {
        //let routes = normalize(feature.properties.routes);
        //let station = normalize(feature.properties.station);
        //return routes.indexOf(value) > -1 || station.indexOf(value) > -1;

        return value in feature.properties
    });

    filteredInputPoint.forEach(function(feature){
        filt_id.push(feature.id);
        renderListing_click.push(feature);
    });
    filt_id = [... new Set(filt_id)];
    renderListing_click = [... new Set(renderListing_click)];

    //Route
    filteredInputLine = routes.filter(function(feature) {
        let routes = normalize(feature.properties.RouteNameZ);
        //return routes.indexOf(value) > -1;
        return value === feature.properties.RouteNameZ;
    });

    filteredInputLine.forEach(function(feature){
        filt_id_r.push(feature.id);
    });
    filt_id_r = [... new Set(filt_id_r)];
}

let renderListing_iso = [];
let station_seq = {}; //keep clicked routes and their sequence
let time_calc = {};
let time_calc_r = {};
let input_ftr_id = [];
let input_ftr_id_r = [];
let doubleDirection = 0

function isoFilter(start_seq, clicked_dir, time_calc_obj, value, push_list){
    let maxSeqInZoom = 1
    for (var dirSeq in time_calc_obj[value]){
        if (parseInt(dirSeq.split('-')[1]) > maxSeqInZoom ){
            maxSeqInZoom = parseInt(dirSeq.split('-')[1]);
        }
    }

    time_cost = 0;
    while (time_cost < parseInt(iso_slider.value) && start_seq <= maxSeqInZoom){
        //console.log(start_seq);
        if (typeof(time_calc_obj[value]) !== 'undefined' 
            && typeof(time_calc_obj[value][clicked_dir+'-'+start_seq]) !== 'undefined'){
            time_cost += time_calc_obj[value][clicked_dir+'-'+start_seq]['cost'];
            push_list.push(time_calc_obj[value][clicked_dir+'-'+start_seq]['ftr_id']);
        }
        start_seq += 1;
    }

}

function featureUpdates_iso_id(value, filteredInputPoint, filteredInputLine, click_seq){
    if (click_seq[value]){
        //Station
        // 1. Get stations with sequence larger than click_seq and same direction code
        let checked_seq = {}
        filteredInputPoint = stations.filter(function(feature) {

            let routeOfStation = feature.properties.routes.replace(/"|\[|\]/g,'').split(','); //This is a route list
            routeOfStation.forEach(function(route){
                rawCodeObj = feature.properties[route].replace(/"|\[|\]/g,'').split(',') // ex. 1-20-30-1
                if (route === value) {
                    rawCodeObj.forEach(function(rawCode){
                        checked_seq[route] = {'seq':parseInt(rawCode.split('-')[1]),
                                              'dir':parseInt(rawCode.split('-')[0]),
                                              'cost':parseInt(rawCode.split('-')[3])};
                    })
                }
            })
            if (click_seq[value]['doubleDir'] === 0) {
                return value in feature.properties 
                && checked_seq[value]['seq'] >= click_seq[value]['seq']
                && checked_seq[value]['dir'] === click_seq[value]['dir']
            } else {

                return value in feature.properties 
                && checked_seq[value]['seq'] >= click_seq[value][ checked_seq[value]['dir'] ]['seq']


                //&& checked_seq[value]['dir'] === click_seq[value][0]['dir']
            }


        });

        // 2. Extract sequence, direction and time cost from selected stations as time_calc
        filteredInputPoint.forEach(function(feature){
            let routeOfStation = feature.properties.routes.replace(/"|\[|\]/g,'').split(','); //This is a route list
            routeOfStation.forEach(function(route){
                if (route === value){
                    rawCodeString = feature.properties[route].replace(/"|\[|\]/g,'').split(','); // ex. 1-20-30-1
                    rawCodeString.forEach(function(rawCode){
                        // handling singe station with stops in both directions
                        if (click_seq[value]['doubleDir'] === 0) {
                            if (rawCode.split('-')[0] == click_seq[value]['dir']){
                                if (route in time_calc) {
                                    keyDirSeq = rawCode.split('-')[0] + '-' + rawCode.split('-')[1];
                                    time_calc[route][keyDirSeq] = {'seq':parseInt(rawCode.split('-')[1]),
                                                                   'dir':parseInt(rawCode.split('-')[0]),
                                                                   'cost':parseInt(rawCode.split('-')[3]),
                                                                   'ftr_id':feature.id};   
                                } else {
                                    time_calc[route] = {};
                                    keyDirSeq = rawCode.split('-')[0] + '-' + rawCode.split('-')[1];
                                    time_calc[route][keyDirSeq] = {'seq':parseInt(rawCode.split('-')[1]),
                                                                   'dir':parseInt(rawCode.split('-')[0]),
                                                                   'cost':parseInt(rawCode.split('-')[3]),
                                                                   'ftr_id':feature.id};  
                                }
                            }
                        } else {
                            if (route in time_calc) {
                                keyDirSeq = rawCode.split('-')[0] + '-' + rawCode.split('-')[1];
                                time_calc[route][keyDirSeq] = {'seq':parseInt(rawCode.split('-')[1]),
                                                               'dir':parseInt(rawCode.split('-')[0]),
                                                               'cost':parseInt(rawCode.split('-')[3]),
                                                               'ftr_id':feature.id};   
                            } else {
                                time_calc[route] = {};
                                keyDirSeq = rawCode.split('-')[0] + '-' + rawCode.split('-')[1];
                                time_calc[route][keyDirSeq] = {'seq':parseInt(rawCode.split('-')[1]),
                                                               'dir':parseInt(rawCode.split('-')[0]),
                                                               'cost':parseInt(rawCode.split('-')[3]),
                                                               'ftr_id':feature.id};  
                            }
                        }
                    })
                }
            })
        });

        // 3. Filter stations with time cost lower than value in iso bar.
        //console.log('doubleDir:',doubleDirection);
        if (click_seq[value]['doubleDir'] === 0){
            input_ftr_id = [];
            isoFilter(start_seq=click_seq[value]['seq'],
                      clicked_dir=click_seq[value]['dir'],
                      time_calc_obj=time_calc,
                      value=value,
                      push_list=input_ftr_id);

        } else {
            input_ftr_id = [];
            isoFilter(start_seq=click_seq[value][0]['seq'],
                      clicked_dir=click_seq[value][0]['dir'],
                      time_calc_obj=time_calc,
                      value=value,
                      push_list=input_ftr_id);

            isoFilter(start_seq=click_seq[value][1]['seq'],
                      clicked_dir=click_seq[value][1]['dir'],
                      time_calc_obj=time_calc,
                      value=value,
                      push_list=input_ftr_id);

        }

        filteredInputPoint = filteredInputPoint.filter(function(feature){
            return input_ftr_id.includes(feature.id);
        })

        // 4. Update listing, return filt_id
        filteredInputPoint.forEach(function(feature){
            filt_id.push(feature.id);
            renderListing_iso.push(feature);
        });
        filt_id = [... new Set(filt_id)];
        renderListing_iso = [... new Set(renderListing_iso)];


        //Route
        // 1. Get segment with sequence larger than click_seq and same direction code
        filteredInputLine = routes.filter(function(feature) {
            props = feature.properties;

            if (click_seq[value]['doubleDir'] === 0) {
                return value === props.RouteNameZ 
                && props.start_stop >= click_seq[value]['seq']
                && props.direction === click_seq[value]['dir']
            } else {
                return value === props.RouteNameZ 
                && props.start_stop >= click_seq[value][ props.direction ]['seq']
            }
        });

        // 2. Extract sequence, direction and time cost from selected stations as time_calc
        filteredInputLine.forEach(function(feature){
            props = feature.properties;
            if (props.RouteNameZ === value){
                if (props.RouteNameZ in time_calc_r) {
                    keyDirSeq = props.direction + '-' + props.start_stop;
                    time_calc_r[props.RouteNameZ][keyDirSeq] = {'seq':props.start_stop,
                                                                'dir':props.direction,
                                                                'cost':props.cost,
                                                                'ftr_id':feature.id};   
                } else {
                    time_calc_r[props.RouteNameZ] = {};
                    keyDirSeq = props.direction + '-' + props.start_stop;
                    time_calc_r[props.RouteNameZ][keyDirSeq] = {'seq':props.start_stop,
                                                                'dir':props.direction,
                                                                'cost':props.cost,
                                                                'ftr_id':feature.id};   
                }
            }     

        });

        // 3. Filter stations with time cost lower than value in iso bar.
        if (click_seq[value]['doubleDir'] === 0){
            //input_ftr_id_r = [];
            isoFilter(start_seq=click_seq[value]['seq'],
                      clicked_dir=click_seq[value]['dir'],
                      time_calc_obj=time_calc_r,
                      value=value,
                      push_list=input_ftr_id_r);

        } else {
            //input_ftr_id_r = [];
            isoFilter(start_seq=click_seq[value][0]['seq'],
                      clicked_dir=click_seq[value][0]['dir'],
                      time_calc_obj=time_calc_r,
                      value=value,
                      push_list=input_ftr_id_r);

            isoFilter(start_seq=click_seq[value][1]['seq'],
                      clicked_dir=click_seq[value][1]['dir'],
                      time_calc_obj=time_calc_r,
                      value=value,
                      push_list=input_ftr_id_r);

        }

        // 4. Update listing, return filt_id_r
        filteredInputLine.forEach(function(feature){
            filt_id_r.push(feature.id);
        });
        filt_id_r = [... new Set(filt_id_r)];

        filt_id_r_on = input_ftr_id_r;
        filt_id_r_off = filt_id_r.filter( function(n) { return !this.has(n) }, new Set(filt_id_r_on) );


    }
}

//Generate features except from featureUpdates_click_id
function featureUpdates_res_id(){
    res = all_id.filter( function(n) { return !this.has(n) }, new Set(filt_id) );
    res_r = all_id_r.filter( function(n) { return !this.has(n) }, new Set(filt_id_r) );
};

//Update clicked feature status
function featureUpdates_click(){
    filt_id_r.forEach(function(id){
        map.setFeatureState({
            source: 'routes',
            sourceLayer: source_layer_2,
            id: id
        }, {
            click: true
        });
    });

    res_r.forEach(function(id){
        map.setFeatureState({
            source: 'routes',
            sourceLayer: source_layer_2,
            id: id
        }, {
            click: false
        });
    });

    filt_id.forEach(function(id){
        map.setFeatureState({
            source: 'stations',
            sourceLayer: source_layer,
            id: id
        }, {
            click: true
        });
    });

    res.forEach(function(id){
        map.setFeatureState({
            source: 'stations',
            sourceLayer: source_layer,
            id: id
        }, {
            click: false
        });
    });


};

//Update iso feature status
function featureUpdates_iso(){
    filt_id_r.forEach(function(id){
        map.setFeatureState({
            source: 'routes',
            sourceLayer: source_layer_2,
            id: id
        }, {
            iso_on: false
        });
    });

    filt_id_r.forEach(function(id){
        map.setFeatureState({
            source: 'routes',
            sourceLayer: source_layer_2,
            id: id
        }, {
            iso_off: false
        });
    });


    filt_id_r_on.forEach(function(id){
        map.setFeatureState({
            source: 'routes',
            sourceLayer: source_layer_2,
            id: id
        }, {
            iso_on: true
        });
    });

    filt_id_r_on.forEach(function(id){
        map.setFeatureState({
            source: 'routes',
            sourceLayer: source_layer_2,
            id: id
        }, {
            iso_off: false
        });
    });

    filt_id_r_off.forEach(function(id){
        map.setFeatureState({
            source: 'routes',
            sourceLayer: source_layer_2,
            id: id
        }, {
            iso_on: false
        });
    });

    filt_id_r_off.forEach(function(id){
        map.setFeatureState({
            source: 'routes',
            sourceLayer: source_layer_2,
            id: id
        }, {
            iso_off: true
        });
    });



    res_r.forEach(function(id){
        map.setFeatureState({
            source: 'routes',
            sourceLayer: source_layer_2,
            id: id
        }, {
            iso_on: false
        });
    });

    res_r.forEach(function(id){
        map.setFeatureState({
            source: 'routes',
            sourceLayer: source_layer_2,
            id: id
        }, {
            iso_off: false
        });
    });

    filt_id.forEach(function(id){
        map.setFeatureState({
            source: 'stations',
            sourceLayer: source_layer,
            id: id
        }, {
            iso: true
        });
    });

    res.forEach(function(id){
        map.setFeatureState({
            source: 'stations',
            sourceLayer: source_layer,
            id: id
        }, {
            iso: false
        });
    });


};

let radios = document.getElementsByName('direction');
let all_id_dir = [];
let filt_id_dir = [];
let res_id_dir = [];
let filteredOnRoutes = [];

function directionListGenerator(direction, filtered_input){
    filteredOnRoutes = [];
    filt_id_dir = [];
    //Get station with direction value as 0
    filtered_input.forEach(function(feature){
        let routeDir_text = feature.properties[value].replace(/\[|\]|\"/g,'').split(',');
        routeDir_text.forEach(function(info){
            if(direction !== ''){
                if(info[0]===direction){
                    filteredOnRoutes.push(feature)
                }
            } else {
                filteredOnRoutes.push(feature)
                filteredOnRoutes = [...new Set(filteredOnRoutes)];
            }
        })

    });
    renderListings(filteredOnRoutes);
    filteredOnRoutes.forEach(function(feature){
        filt_id_dir.push(feature.id);
    });
    res_dir = all_id_dir.filter( function(n) { return !this.has(n) }, new Set(filt_id_dir));

}

let label_colors = document.getElementsByClassName("dir_style");
function OnChangeCheckbox (checkbox) {
    if (checkbox.checked) {
        //Default check 'both' direction, and black direction buttons
        document.getElementById("dir2").checked = true;
        for(var i=0; i<radios.length; i++) {
            radios[i].disabled=false;
        }

        for(var i=0; i<label_colors.length; i++) {
            label_colors[i].style.color = 'black';
        }

        // Disable Iso
        document.getElementById("isoBox").checked = false;
        iso_slider.disabled = true;
        iso_status = false;
        iso_slider.value = 30; //set slider to default time
        output.innerHTML = "30"; //set label to default label

        //value = '';
        //filterEl.value = '';
        all_id = [];
        filt_id = [];
        all_id_r = [];
        filt_id_r = [];

        stations.forEach(function(feature){
            all_id.push(feature.id);
        });
        routes.forEach(function(feature){
            all_id_r.push(feature.id);
        });
        exactMatch = document.getElementsByName('matchAnswer')[0].checked;
        featureUpdates(value,filtered);
        featureUpdates_r(value,filtered_r);
    }
    else {
        direction_button = false;
        document.getElementById("dir2").checked = true;
        for(var i=0; i<radios.length; i++) {
            radios[i].disabled=true;
        }

        for(var i=0; i<label_colors.length; i++) {
            label_colors[i].style.color = 'grey';
        }

        //value = '';
        //filterEl.value = '';
        all_id = [];
        filt_id = [];
        all_id_r = [];
        filt_id_r = [];

        stations.forEach(function(feature){
            all_id.push(feature.id);
        });
        routes.forEach(function(feature){
            all_id_r.push(feature.id);
        });
        exactMatch = document.getElementsByName('matchAnswer')[0].checked;
        featureUpdates(value,filtered);
        featureUpdates_r(value,filtered_r);
    }
}

let savedFeature = [];
let savedRoute = [];

function OnChangeRadioBox(checkbox) {
    if(value){
        all_id_dir = [];
        filt_id_dir = [];
        res_id_dir = [];
        direction_button = true;
        stations = features;
        stations.forEach(function(feature){
            all_id_dir.push(feature.id);
        });
        let filtered_dir = stations.filter(function(feature) {
            let station = normalize(feature.properties.station);
            return value in feature.properties || value === station;
        });

        //Direction (integer, optional):
        //去返程 : [0:'去程',1:'返程',2:'迴圈',255:'未知'] ,
        for (var i = 0, length = radios.length; i < length; i++) {
            if (radios[0].checked) {
                directionListGenerator('0',filtered_dir);
                break;

            } else if (radios[1].checked){
                directionListGenerator('1',filtered_dir);
                break;

            } else if (radios[2].checked){
                directionListGenerator('',filtered_dir);
                break;

            }
        }
        filt_id_dir.forEach(function(id){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: id
            }, {
                select: true
            });
        });

        res_dir.forEach(function(id){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: id
            }, {
                select: false
            });
        });
    } else {
        all_id_dir.forEach(function(id){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: id
            }, {
                select: false
            });
        });
    }
}

let iso_status = false;
function OnChangeIsoBox(checkbox) {
    if (checkbox.checked) {
        iso_slider.disabled = false;
        iso_status = true;  
        filterEl.value = ''; // clean up value input box
        document.getElementById("isoLabel").style.color = 'black';
        document.getElementById("time").style.color = 'black';

        //turn off click results
        all_id.forEach(function(id){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: id
            }, {
                clickMain: false
            });
        });


        all_id_r.forEach(function(id){
            map.setFeatureState({
                source: 'routes',
                sourceLayer: source_layer_2,
                id: id
            }, {
                click: false
            });
        });
        all_id.forEach(function(id){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: id
            }, {
                click: false
            });
        });

        // select off
        all_id_r.forEach(function(id){
            map.setFeatureState({
                source: 'routes',
                sourceLayer: source_layer_2,
                id: id
            }, {
                select: false
            });
        });
        all_id.forEach(function(id){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: id
            }, {
                select: false
            });
        });

        all_id.forEach(function(id){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: id
            }, {
                edge: false
            });
        });

        access = [];
        all_id = [];
        filt_id = [];
        all_id_r = [];
        filt_id_r = [];
        renderListing_iso = [];
        filt_id_r_on = [];
        filt_id_r_off = [];


    } else {
        iso_slider.disabled = true;
        iso_status = false;
        iso_slider.value = 5; //set slider to default time
        output.innerHTML = "5"; //set label to default label
        document.getElementById("isoLabel").style.color = 'grey';
        document.getElementById("time").style.color = 'grey';

        all_id.forEach(function(id){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: id
            }, {
                isoMain: false
            });
        });

        //filt_id_r
        filt_id_r.forEach(function(id){
            map.setFeatureState({
                source: 'routes',
                sourceLayer: source_layer_2,
                id: id
            }, {
                iso_on: false
            });
        });

        filt_id_r.forEach(function(id){
            map.setFeatureState({
                source: 'routes',
                sourceLayer: source_layer_2,
                id: id
            }, {
                iso_off: false
            });
        });

        //filt_id_r_on
        filt_id_r_on.forEach(function(id){
            map.setFeatureState({
                source: 'routes',
                sourceLayer: source_layer_2,
                id: id
            }, {
                iso_on: false
            });
        });

        //filt_id_r_off
        filt_id_r.forEach(function(id){
            map.setFeatureState({
                source: 'routes',
                sourceLayer: source_layer_2,
                id: id
            }, {
                iso_off: false
            });
        });

        res_r.forEach(function(id){
            map.setFeatureState({
                source: 'routes',
                sourceLayer: source_layer_2,
                id: id
            }, {
                iso: false
            });
        });

        filt_id.forEach(function(id){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: id
            }, {
                iso: false
            });
        });

        res.forEach(function(id){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: id
            }, {
                iso: false
            });
        });

        access = [];
        all_id = [];
        filt_id = [];
        all_id_r = [];
        filt_id_r = [];
        renderListing_iso = [];
        filt_id_r_on = [];
        filt_id_r_off = [];

    }


    //disabled exactMactch and directions while clicking
    direction_button = false;
    document.getElementsByName('matchAnswer')[0].checked = false;
    document.getElementById("dir2").checked = true;
    for(var i=0; i<radios.length; i++) {
        radios[i].disabled=true;
    }
    for(var i=0; i<label_colors.length; i++) {
        label_colors[i].style.color = 'grey';
    }


}

const zoomThreshold = 12.75;

map.on('load', function(){
    //Route Layer
    map.addSource("routes", {
        "type": "vector",
        "url": source_url_2
    });
    //Route Layer except iso_on 
    map.addLayer({
        'id': 'station-route',
        'type': 'line',
        'source': 'routes',
        'layout': {
            'visibility': 'visible'
        },
        'source-layer': source_layer_2,
        'paint': {
            'line-color': [
                'case',
                ['boolean', ['feature-state', 'select'], false],
                '#dd3497',
                ['boolean', ['feature-state', 'click'], false],
                '#fd8d3c',
                ['boolean', ['feature-state', 'iso'], false],
                'rgba(0,0,0,0)',
                ['boolean', ['feature-state', 'iso_off'], false],
                '#fcbba1',
                'rgba(0,0,0,0)'
            ]
        }
    });
    //Route Layer for iso_on, add after the rest route layer so the features will appear on top
    map.addLayer({
        'id': 'station-route_iso',
        'type': 'line',
        'source': 'routes',
        'layout': {
            'visibility': 'visible'
        },
        'source-layer': source_layer_2,
        'paint': {
            'line-color': [
                'case',
                ['boolean', ['feature-state', 'iso_on'], false],
                '#ef3b2c',
                'rgba(0,0,0,0)'
            ],
            'line-width': [
                'case',
                ['boolean', ['feature-state', 'iso_on'], false],
                2,
                0  
            ]
        }
    });

    //Station Layers
    map.addSource("stations", {
        "type": "vector",
        "url": source_url
    });
    //Station Layer in smaller zoom
    map.addLayer({
        'id': 'station-origin-smallZoom',
        'type': 'circle',
        'source': 'stations',
        'layout':{
            'visibility': 'visible'
        },
        'source-layer': source_layer,
        'maxzoom': zoomThreshold,
        //'minzoom': 12,
        'paint': {
            'circle-radius': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                8,
                ['boolean', ['feature-state', 'edge'], false],
                4,
                ['boolean', ['feature-state', 'select'], false],
                2,
                ['boolean', ['feature-state', 'clickMain'], false],
                4,
                ['boolean', ['feature-state', 'click'], false],
                2,
                ['boolean', ['feature-state', 'isoMain'], false],
                4,
                ['boolean', ['feature-state', 'iso'], false],
                2,
                1
            ],
            'circle-color': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                'red',
                ['boolean', ['feature-state', 'edge'], false],
                'orange',
                ['boolean', ['feature-state', 'select'], false],
                '#fff700',
                ['boolean', ['feature-state', 'clickMain'], false],
                'red',
                ['boolean', ['feature-state', 'click'], false],
                '#f7fcb9',
                ['boolean', ['feature-state', 'isoMain'], false],
                '#feb24c',
                ['boolean', ['feature-state', 'iso'], false],
                '#f7fcb9',
                'rgba(0,0,0,0)'
            ],
            'circle-stroke-width': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                1,
                ['boolean', ['feature-state', 'edge'], false],
                1,
                ['boolean', ['feature-state', 'select'], false],
                0.7,
                ['boolean', ['feature-state', 'clickMain'], false],
                1,
                ['boolean', ['feature-state', 'click'], false],
                0.7,
                ['boolean', ['feature-state', 'isoMain'], false],
                1,
                ['boolean', ['feature-state', 'iso'], false],
                0.7,
                0.3
            ],
            'circle-stroke-color':[
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                'black',
                ['boolean', ['feature-state', 'edge'], false],
                'black',
                ['boolean', ['feature-state', 'select'], false],
                'black',
                ['boolean', ['feature-state', 'clickMain'], false],
                'black',
                ['boolean', ['feature-state', 'click'], false],
                'black',
                ['boolean', ['feature-state', 'isoMain'], false],
                'black',
                ['boolean', ['feature-state', 'iso'], false],
                'black',
                'rgba(0,0,0,0.25)'
            ],
        }
    });
    //Station Layer in larger zoom
    map.addLayer({
        'id': 'station-origin-LargeZoom',
        'type': 'circle',
        'source': 'stations',
        'layout':{
            'visibility': 'visible'
        },
        'source-layer': source_layer,
        'minzoom': zoomThreshold,
        'paint': {
            'circle-radius': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                10,
                ['boolean', ['feature-state', 'edge'], false],
                8,
                ['boolean', ['feature-state', 'select'], false],
                3.5,
                ['boolean', ['feature-state', 'clickMain'], false],
                6,
                ['boolean', ['feature-state', 'click'], false],
                3.5,
                ['boolean', ['feature-state', 'isoMain'], false],
                6,
                ['boolean', ['feature-state', 'iso'], false],
                3.5,
                3
            ],
            'circle-color': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                'red',
                ['boolean', ['feature-state', 'edge'], false],
                'orange',
                ['boolean', ['feature-state', 'select'], false],
                '#fff700',
                ['boolean', ['feature-state', 'clickMain'], false],
                'red',
                ['boolean', ['feature-state', 'click'], false],
                '#f7fcb9',
                ['boolean', ['feature-state', 'isoMain'], false],
                '#feb24c',
                ['boolean', ['feature-state', 'iso'], false],
                '#f7fcb9',
                'rgba(0,0,0,0)'
            ],
            'circle-stroke-width': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                1,
                ['boolean', ['feature-state', 'edge'], false],
                1,
                ['boolean', ['feature-state', 'select'], false],
                0.7,
                ['boolean', ['feature-state', 'clickMain'], false],
                1,
                ['boolean', ['feature-state', 'click'], false],
                0.7,
                ['boolean', ['feature-state', 'isoMain'], false],
                1,
                ['boolean', ['feature-state', 'iso'], false],
                0.7,
                0.3
            ],
            'circle-stroke-color':[
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                'black',
                ['boolean', ['feature-state', 'edge'], false],
                'black',
                ['boolean', ['feature-state', 'select'], false],
                'black',
                ['boolean', ['feature-state', 'click'], false],
                'black',
                ['boolean', ['feature-state', 'iso'], false],
                'black',
                'rgba(0,0,0,0.25)'
            ],
        }
    });
    //Feature Source Layer
    map.addLayer({
        'id': 'station-access',
        'type': 'circle',
        'source': 'stations',
        'layout':{
            'visibility': 'visible'
        },
        'source-layer': source_layer,
        'paint': {
            'circle-radius': 8,
            'circle-color': 'rgba(0,0,0,0)',
            'circle-stroke-width': 1,
            'circle-stroke-color':'rgba(0,0,0,0)'
        }
    });

    map.on('moveend', function() {
        //Get features after 'moveend'
        //console.log('Current Zoom: ', map.getZoom());

        features = [];
        features_routes = [];
        features = map.queryRenderedFeatures({layers: ['station-access']});
        features_routes = map.queryRenderedFeatures({layers: ['station-route']});

        //Keep all feature ids in a list
        stations = features;
        routes = features_routes;
        //Get all feature id after moveend
        stations.forEach(function(feature){
            all_id.push(feature.id);
        });
        routes.forEach(function(feature){
            all_id_r.push(feature.id);
        });
        //call rednerListing and clean map if the radios, map clicking function
        //and search value isn't active
        if (features && (!radios[0].checked && !radios[1].checked && !click && !value && !iso_status)) {
            // Populate features for the listing overlay.
            renderListings(features);
            //Clean map
            all_id_r.forEach(function(id){
                map.setFeatureState({
                    source: 'routes',
                    sourceLayer: source_layer_2,
                    id: id
                }, {
                    select: false
                });
            });
            all_id.forEach(function(id){
                map.setFeatureState({
                    source: 'stations',
                    sourceLayer: source_layer,
                    id: id
                }, {
                    select: false
                });
            });

            all_id_r.forEach(function(id){
                map.setFeatureState({
                    source: 'routes',
                    sourceLayer: source_layer_2,
                    id: id
                }, {
                    click: false
                });
            });
            all_id.forEach(function(id){
                map.setFeatureState({
                    source: 'stations',
                    sourceLayer: source_layer,
                    id: id
                }, {
                    click: false
                });
            });
            //featureUpdates(value,filtered);
            //featureUpdates_r(value,filtered_r);
        } else if ( !click && value && !iso_status) {
            //Update map according to search value while moving map
            featureUpdates(value,filtered);
            featureUpdates_r(value,filtered_r);
        }


        //console.log(map.getZoom());
        //Update click result only if there is no value in search box
        if(!value && !iso_status && click === true){
            //Clean map
            all_id_r.forEach(function(id){
                map.setFeatureState({
                    source: 'routes',
                    sourceLayer: source_layer_2,
                    id: id
                }, {
                    select: false
                });
            });
            all_id.forEach(function(id){
                map.setFeatureState({
                    source: 'stations',
                    sourceLayer: source_layer,
                    id: id
                }, {
                    select: false
                });
            });

            renderListing_click = [];
            access.forEach(function(routeInStation){
                featureUpdates_click_id(routeInStation,filtered,filtered_r);
                featureUpdates_res_id();
            })
            featureUpdates_click();
            renderListings(renderListing_click);

        }
        if(clickId & click === true & !iso_status){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: clickId
            }, {
                clickMain: true
            });
        }
        if(direction_button){
            OnChangeRadioBox();
        }

        if (iso_status === true){
            //Clean map
            click = false

            //click off
            all_id_r.forEach(function(id){
                map.setFeatureState({
                    source: 'routes',
                    sourceLayer: source_layer_2,
                    id: id
                }, {
                    click: false
                });
            });
            all_id.forEach(function(id){
                map.setFeatureState({
                    source: 'stations',
                    sourceLayer: source_layer,
                    id: id
                }, {
                    click: false
                });
            });

            //select off
            all_id_r.forEach(function(id){
                map.setFeatureState({
                    source: 'routes',
                    sourceLayer: source_layer_2,
                    id: id
                }, {
                    select: false
                });
            });
            all_id.forEach(function(id){
                map.setFeatureState({
                    source: 'stations',
                    sourceLayer: source_layer,
                    id: id
                }, {
                    select: false
                });
            });
            all_id.forEach(function(id){
                map.setFeatureState({
                    source: 'stations',
                    sourceLayer: source_layer,
                    id: id
                }, {
                    edge: false
                });
            });


            renderListing_iso = [];
            access.forEach(function(routeInStation){
                featureUpdates_iso_id(routeInStation,filtered,filtered_r, station_seq);
                featureUpdates_res_id();
            })
            featureUpdates_iso();
            renderListings(renderListing_iso);
        } else {
            all_id.forEach(function(id){
                map.setFeatureState({
                    source: 'stations',
                    sourceLayer: source_layer,
                    id: id
                }, {
                    isoMain: false
                });
            });

            //filt_id_r
            filt_id_r.forEach(function(id){
                map.setFeatureState({
                    source: 'routes',
                    sourceLayer: source_layer_2,
                    id: id
                }, {
                    iso_on: false
                });
            });

            filt_id_r.forEach(function(id){
                map.setFeatureState({
                    source: 'routes',
                    sourceLayer: source_layer_2,
                    id: id
                }, {
                    iso_off: false
                });
            });

            //filt_id_r_on
            filt_id_r_on.forEach(function(id){
                map.setFeatureState({
                    source: 'routes',
                    sourceLayer: source_layer_2,
                    id: id
                }, {
                    iso_on: false
                });
            });

            //filt_id_r_off
            filt_id_r.forEach(function(id){
                map.setFeatureState({
                    source: 'routes',
                    sourceLayer: source_layer_2,
                    id: id
                }, {
                    iso_off: false
                });
            });

            res_r.forEach(function(id){
                map.setFeatureState({
                    source: 'routes',
                    sourceLayer: source_layer_2,
                    id: id
                }, {
                    iso: false
                });
            });

            filt_id.forEach(function(id){
                map.setFeatureState({
                    source: 'stations',
                    sourceLayer: source_layer,
                    id: id
                }, {
                    iso: false
                });
            });

            res.forEach(function(id){
                map.setFeatureState({
                    source: 'stations',
                    sourceLayer: source_layer,
                    id: id
                }, {
                    iso: false
                });
            });
        }


    });

    let hoveredStateId = null;
    let hoveredStateId_r = null;

    /*
    map.on('mousemove','station-route', function(e){
        if (e.features.length > 0) {
            //console.log(e.features);
            map.getCanvas().style.cursor = 'pointer';
            if (hoveredStateId_r) {
                // set the hover attribute to false with feature state
                map.setFeatureState({
                    source: 'routes',
                    sourceLayer: source_layer_2,
                    id: hoveredStateId_r
                }, {
                    iso: false
                });
            }

            hoveredStateId_r = e.features[0].id;
            map.setFeatureState({
                source: 'routes',
                sourceLayer: source_layer_2,
                id: hoveredStateId_r
            }, {
                iso: true
            });
        }
    })
    */

    map.on('mousemove', 'station-access', function(e){
        if (e.features.length > 0) {
            map.getCanvas().style.cursor = 'pointer';
            if (hoveredStateId) {
                // set the hover attribute to false with feature state
                map.setFeatureState({
                    source: 'stations',
                    sourceLayer: source_layer,
                    id: hoveredStateId
                }, {
                    hover: false
                });
            }

            hoveredStateId = e.features[0].id;
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: hoveredStateId
            }, {
                hover: true
            });

            let stationName = e.features[0].properties.station;
            let routes = e.features[0].properties.routes.replace(/"|\[|\]/g,'');
            routes = routes.replace(/,/g,', ');
            stationDisplay.textContent = stationName;
            routeDisplay.textContent = routes;

        }
    });

    // When the mouse leaves the station-origin layer, update the feature state of the
    // previously hovered feature.
    map.on("mouseleave", "station-access", function() {
        map.getCanvas().style.cursor = '';
        if (hoveredStateId) {
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: hoveredStateId
            }, {
                hover: false

            });
        }
        stationDisplay.textContent = '';
        routeDisplay.textContent = '';
        hoveredStateId =  null;
        popup.remove();
    });

    let clickId = null;
    let isoId = null;
    map.on("click", "station-access", function(e){
        //disabled exactMactch and directions while clicking
        direction_button = false;
        document.getElementsByName('matchAnswer')[0].checked = false;
        document.getElementById("dir2").checked = true;
        for(var i=0; i<radios.length; i++) {
            radios[i].disabled=true;
        }
        for(var i=0; i<label_colors.length; i++) {
            label_colors[i].style.color = 'grey';
        }

        //disable previous features
        if (e.features.length > 0) {

            filterEl.value = '';
            value = '';
            //turn off select results
            all_id_r.forEach(function(id){
                map.setFeatureState({
                    source: 'routes',
                    sourceLayer: source_layer_2,
                    id: id
                }, {
                    select: false
                });
            });

            all_id.forEach(function(id){
                map.setFeatureState({
                    source: 'stations',
                    sourceLayer: source_layer,
                    id: id
                }, {
                    select: false
                });
            });

            // Get route and station based on clicked station
            if (iso_status===false) {  

                //Style clicked feature
                if (clickId) {
                    map.setFeatureState({
                        source: 'stations',
                        sourceLayer: source_layer,
                        id: clickId
                    }, {
                        clickMain: false
                    });
                }

                clickId = e.features[0].id;
                map.setFeatureState({
                    source: 'stations',
                    sourceLayer: source_layer,
                    id: clickId
                }, {
                    clickMain: true
                });

                //Diable previous clicks' feature
                if(filt_id){
                    filt_id.forEach(function(id){
                        map.setFeatureState({
                            source: 'stations',
                            sourceLayer: source_layer,
                            id: id
                        }, {
                            click: false
                        });
                    });
                }

                if(filt_id_r){
                    filt_id_r.forEach(function(id){
                        map.setFeatureState({
                            source: 'routes',
                            sourceLayer: source_layer_2,
                            id: id
                        }, {
                            click: false
                        });
                    });
                }

                click = true;
                access = [];
                all_id = [];
                filt_id = [];
                all_id_r = [];
                filt_id_r = [];
                renderListing_click = [];

                access = e.features[0].properties.routes.replace(/"|\[|\]/g,'').split(',');
                stations.forEach(function(feature){
                    all_id.push(feature.id);
                });
                routes.forEach(function(feature){
                    all_id_r.push(feature.id);
                });

                access.forEach(function(value){
                    featureUpdates_click_id(value,filtered,filtered_r);
                    featureUpdates_res_id();
                })
                featureUpdates_click();
                renderListings(renderListing_click);

            } else if (iso_status===true) {

                //Style iso feature
                if (isoId) {
                    map.setFeatureState({
                        source: 'stations',
                        sourceLayer: source_layer,
                        id: isoId
                    }, {
                        isoMain: false
                    });
                }

                isoId = e.features[0].id;
                map.setFeatureState({
                    source: 'stations',
                    sourceLayer: source_layer,
                    id: isoId
                }, {
                    isoMain: true
                });

                //Diable previous clicks' feature
                if(filt_id){
                    filt_id.forEach(function(id){
                        map.setFeatureState({
                            source: 'stations',
                            sourceLayer: source_layer,
                            id: id
                        }, {
                            iso: false
                        });
                    });
                }

                if(filt_id_r){
                    filt_id_r.forEach(function(id){
                        map.setFeatureState({
                            source: 'routes',
                            sourceLayer: source_layer_2,
                            id: id
                        }, {
                            iso_on: false
                        });
                    });

                    filt_id_r.forEach(function(id){
                        map.setFeatureState({
                            source: 'routes',
                            sourceLayer: source_layer_2,
                            id: id
                        }, {
                            iso_off: false
                        });
                    });
                }

                click = false;
                access = [];
                all_id = [];
                filt_id = [];
                all_id_r = [];
                filt_id_r = [];
                renderListing_iso = [];
                filt_id_r_on = [];
                filt_id_r_off = [];
                input_ftr_id_r = [];

                //for issued route checking
                let routesC = e.features[0].properties.routes.replace(/"|\[|\]/g,'');
                routesC = routesC.replace(/,/g,', ');
                //console.log(routesC);
                //console.log('features: ',e.features[0]);
                //


                station_seq = {}; //the sequences of all routes in clicked station

                access = e.features[0].properties.routes.replace(/"|\[|\]/g,'').split(','); //This is a route list
                access.forEach(function(route){
                    //console.log(route, e.features[0].properties[route].replace(/"|\[|\]/g,'')); 
                    rawCode = e.features[0].properties[route].replace(/"|\[|\]/g,'') // ex. 1-20-30-1
                    if (rawCode.split(',').length === 1){
                        station_seq[route] = {'seq':parseInt(rawCode.split('-')[1]),
                                              'dir':parseInt(rawCode.split('-')[0]),
                                              'cost':parseInt(rawCode.split('-')[3]),
                                              'maxSeq':parseInt(rawCode.split('-')[2]),
                                              'doubleDir': 0};
                    } else {

                        let rawCodeStringClick = ''
                        station_seq[route] = {'doubleDir': 1};
                        rawCodeStringClick = e.features[0].properties[route].replace(/"|\[|\]/g,'').split(','); // ex. 1-20-30-1
                        rawCodeStringClick.forEach(function(rawCodeC){
                            station_seq[route][parseInt(rawCodeC.split('-')[0])] = {'seq':parseInt(rawCodeC.split('-')[1]),
                                                                                    'dir':parseInt(rawCodeC.split('-')[0]),
                                                                                    'cost':parseInt(rawCodeC.split('-')[3]),
                                                                                    'maxSeq':parseInt(rawCodeC.split('-')[2])
                                                                                   };
                        })

                    }
                })

                stations.forEach(function(feature){
                    all_id.push(feature.id);
                });
                routes.forEach(function(feature){
                    all_id_r.push(feature.id);
                });

                time_calc = {};
                time_calc_r = {};
                access.forEach(function(value){
                    featureUpdates_iso_id(value,filtered,filtered_r,station_seq);
                    featureUpdates_res_id();
                })

                featureUpdates_iso();
                renderListings(renderListing_iso);
            }
        }
    });

    filterEl.addEventListener('keyup', function(e) {
        //Ture off 'click' so that the click result won't aprear
        //while input is back to empty
        document.getElementById("dir2").checked = true;
        exactMatch = document.getElementsByName('matchAnswer')[0].checked;
        click = false;
        if (clickId) {
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: clickId
            }, {
                clickMain: false
            });
        }
        clickId = null;
        if(exactMatch){
            value = e.target.value;
        } else {
            value = normalize(e.target.value);
        }

        //turn off click results
        all_id_r.forEach(function(id){
            map.setFeatureState({
                source: 'routes',
                sourceLayer: source_layer_2,
                id: id
            }, {
                click: false
            });
        });
        all_id.forEach(function(id){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: id
            }, {
                click: false
            });
        });

        //turn off edge feature in search
        if(edgeEndId){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: edgeEndId
            }, {
                edge: false
            });
        }
        if(edgeStartId){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: edgeStartId
            }, {
                edge: false
            });
        }
        edgeStartId = null;
        edgeEndId = null;

        // Disable Iso

        document.getElementById("isoBox").checked = false;
        iso_slider.disabled = true;
        iso_status = false;
        iso_slider.value = 5; //set slider to default time
        output.innerHTML = "5"; //set label to default label

        all_id.forEach(function(id){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: id
            }, {
                isoMain: false
            });
        });

        filt_id_r.forEach(function(id){
            map.setFeatureState({
                source: 'routes',
                sourceLayer: source_layer_2,
                id: id
            }, {
                iso_on: false
            });
        });

        filt_id_r.forEach(function(id){
            map.setFeatureState({
                source: 'routes',
                sourceLayer: source_layer_2,
                id: id
            }, {
                iso_off: false
            });
        });

        res_r.forEach(function(id){
            map.setFeatureState({
                source: 'routes',
                sourceLayer: source_layer_2,
                id: id
            }, {
                iso_on: false
            });
        });

        res_r.forEach(function(id){
            map.setFeatureState({
                source: 'routes',
                sourceLayer: source_layer_2,
                id: id
            }, {
                iso_off: false
            });
        });

        filt_id.forEach(function(id){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: id
            }, {
                iso: false
            });
        });

        res.forEach(function(id){
            map.setFeatureState({
                source: 'stations',
                sourceLayer: source_layer,
                id: id
            }, {
                iso: false
            });
        });


        //Empty id list before new search based on each keyin
        all_id = [];
        filt_id = [];
        all_id_r = [];
        filt_id_r = [];

        stations.forEach(function(feature){
            all_id.push(feature.id);
        });
        routes.forEach(function(feature){
            all_id_r.push(feature.id);
        });
        featureUpdates(value,filtered);
        featureUpdates_r(value,filtered_r);

    });

    iso_slider.addEventListener('click', function(e){
        all_id = [];
        filt_id = [];
        all_id_r = [];
        filt_id_r = [];
        filt_id_r_on = [];
        filt_id_r_off = [];
        renderListing_iso = [];
        input_ftr_id_r = [];

        //console.log(e.features[0].properties);

        stations.forEach(function(feature){
            all_id.push(feature.id);
        });
        routes.forEach(function(feature){
            all_id_r.push(feature.id);
        });

        //time_calc = {};
        access.forEach(function(value){
            featureUpdates_iso_id(value,filtered,filtered_r,station_seq);
            featureUpdates_res_id();
        })

        featureUpdates_iso();
        renderListings(renderListing_iso);

    })


    // Direction selectors
    document.getElementById("dir2").checked = true;
    for(var i=0; i<radios.length; i++) {
        radios[i].disabled=true;
    }
    for(var i=0; i<label_colors.length; i++) {
        label_colors[i].style.color = 'grey';
    }
    //iso label default status
    document.getElementById("isoLabel").style.color = 'grey';
    document.getElementById("time").style.color = 'grey';


    // Call this function on initialization
    // passing an empty array to render an empty state
    renderListings([]);
});

// Isochrone controls
iso_slider.disabled = true;
output.innerHTML = iso_slider.value;
iso_slider.oninput = function() {
    output.innerHTML = this.value;
}