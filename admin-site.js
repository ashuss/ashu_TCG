define(['angular', './sample-module'], function (angular, controllers) {
    'use strict';
    // Controller definition
    controllers.controller('AdminSiteCtrl', ['$scope', '$timeout', '$log', '$interval', 'fetchService', 'PostService', '$http', 'PredixAssetService', 'PredixViewService', function ($scope, $timeout, $log, $interval, fetchService, PostService, $http, PredixAssetService, PredixViewService) {

        $scope.showMapPx = false;
        $scope.sitePerimeter = false;
        $scope.siteZone = false;
        $scope.showCreateTable = false;
        $scope.selectedZone = "";
        $scope.addSiteBoundryMarker = false;
        $scope.zoneSelected = false;
        $scope.inEditZone = false;
        $scope.resetDisable = true;
        $scope.zoneId = "";
        $scope.errorMessageSite = "";
        $scope.siteSwitch = false;
        $scope.firstTime = true;
        $scope.siteExists = false;
        $scope.thresholdRainfallfromAPI = ""
        var endDate = "", startDate = "";
        // $scope.showError = false;
        $scope.existingBoundry = [];
        $scope.boundryLatLngList = [];
        $scope.zoneLatLngList = [];

        var pxtable = document.getElementById("mytable");

        $scope.myZones = [{ id: "dangerZone", name: "Danger Zone" }, { id: "safeZone", name: "Safe Assembly Zone" }];

        var map = document.getElementById('siteMap');


        //        _______________________________SOS___________________________________
        $scope.callSOS = function () {
            fetchService.fetchSOS("PendingSOS").success(function (pendingData) {
                $scope.pendingRes = pendingData;
            });
        }

        $interval(function () { $scope.callSOS(); }, 5000);
        //        __________________________SOSEND_________________________________________________

        //        fetchService.fetchLocation().success(function(data){
        //            $scope.locationData=data;
        //        });



        var fetchLocData = function () {

            fetchService.fetchLocation().success(function (data) {

                var locData = [];
                angular.forEach(data, function (value, key) {
                    console.log(key + " : " + value);
                    var tempData = {
                        "key": value,
                        "val": value.locationName
                    };
                    //console.log("tempData",tempData);
                    locData = locData.concat(tempData);

                });

                console.log("locData", locData);
                $scope.locDataPx = locData;

            });

        }
        fetchLocData();

        //Getting SiteId from Dropdown
        document.getElementById('locDropDown').addEventListener("px-dropdown-value-changed", function (e) {
            $scope.locationValue = e.detail.key;
        });
        //			 $scope.siteId = e.detail.key.siteId;
        //            $scope.siteName = e.detail.value;
        //console.log("site :", $scope.siteId) ;

        //        $http.get("/images/test_px.json").success(function(data){
        var fetchSiteData = function () {
            fetchService.fetchSite("0").success(function (data) {
                console.log("fetchDataSite", data);
                showSiteinTable(data)
            })
        }
        fetchSiteData();

        function showSiteinTable(data) {
            angular.forEach(data, function (value, key) {
                var lat = value.latitude;
                var lng = value.longitude;
                var zoom = value.zoom;
                console.log("siteID---------------", value.siteId)
                var viewMap = '<paper-button toggles class="custom inTable" onclick="showMap(' + value.siteId + ',' + lat + ',' + lng + ',' + zoom + ')"><i class="fa fa-globe" aria-hidden="true"></i></paper-button>';
                var del = '<paper-button toggles class="custom inTable" onclick="deleteSite(' + value.siteId + ')"><i class="fa fa-trash-o" aria-hidden="true"></i></paper-button>';
                data[key]["viewMap"] = viewMap;
                data[key]["delete"] = del;
                console.log(data);
            });
            $scope.finalData = data;
        }


        //        **********************Map Click Event*******************
        $scope.countMarkerSite = 0;

        document.getElementById('siteMap').addEventListener('google-map-click', function (e) {
            console.log("lat", e.detail.latLng.lat());
            console.log("lng", e.detail.latLng.lng());
            $scope.countMarkerSite++;
            console.log($scope.countMarkerSite);
            var markers = document.createElement('google-map-marker');

            //console.log("selected zone is"+$scope.selectedZone);
            // if ($scope.selectedZone == "Danger Zone") {
            //         marker.setAttribute("icon", "/images/Marker_2.png");
            //     }

            // else if ($scope.selectedZone == "Safe Assembly Zone") {
            //         marker.setAttribute("icon", "/images/Marker_1.png");
            //     }
            //     marker.setAttribute('click-events', 'true');
            //     Polymer.dom(map).appendChild(marker);


            //******************If New Site Boundry is Added**************
            if ($scope.addSiteBoundryMarker) {
                var tempObj = {};
                tempObj = {
                    "latitude": e.detail.latLng.lat(),
                    "longitude": e.detail.latLng.lng()
                }
                $scope.boundryLatLngList.push(tempObj)
                markers.setAttribute("latitude", e.detail.latLng.lat())
                markers.setAttribute("longitude", e.detail.latLng.lng());
                markers.setAttribute("id", "siteBoundryMarkers");
                markers.setAttribute("icon", "/images/markers.png")
                Polymer.dom(map).appendChild(markers);
                $scope.resetDisable = true;
            } else if ($scope.zoneSelected) {
                //display marker here
                markers.setAttribute("latitude", e.detail.latLng.lat())
                markers.setAttribute("longitude", e.detail.latLng.lng());
                console.log("Selected Zone is: " + $scope.selectedZone);
                markers.setAttribute("id", "siteBoundryMarkers");
                if ($scope.selectedZone == "Danger Zone") {
                    markers.setAttribute("icon", "/images/Marker_2.png");
                }

                else if ($scope.selectedZone == "Safe Assembly Zone") {
                    markers.setAttribute("icon", "/images/Marker_1.png");
                }

                document.getElementById("lat").setAttribute("value", e.detail.latLng.lat());
                document.getElementById("long").setAttribute("value", e.detail.latLng.lng());
                console.log("$scope.lngList,", $scope.lngList, "$scope.latList", $scope.latList, "long", e.detail.latLng.lng(), "lat", e.detail.latLng.lat());

                var pnpolyInsideOut = pnpoly($scope.lngList, $scope.latList, e.detail.latLng.lng(), e.detail.latLng.lat());
                if (pnpolyInsideOut == true) {
                    markers.setAttribute('click-events', 'true');
                    //markers.setAttribute("icon", "/images/Marker_1.png")
                    Polymer.dom(map).appendChild(markers);
                } else {
                    document.getElementById("markerClickMsg").toggle();
                }
            } else if ($scope.inEditZone) {
                var tempObj = {};
                tempObj = {
                    "latitude": e.detail.latLng.lat(),
                    "longitude": e.detail.latLng.lng()
                }
                $scope.zoneLatLngList.push(tempObj)
                markers.setAttribute("latitude", e.detail.latLng.lat())
                markers.setAttribute("longitude", e.detail.latLng.lng());
                markers.setAttribute("id", "zoneBoundryMarkers");
                //Polymer.dom(map).appendChild(markers);
                var pnpolyInsideOut = pnpoly($scope.lngList, $scope.latList, e.detail.latLng.lng(), e.detail.latLng.lat());
                if (pnpolyInsideOut == true) {
                    markers.setAttribute('click-events', 'true');
                    //markers.setAttribute("icon", "/images/Marker_1.png")
                    Polymer.dom(map).appendChild(markers);
                } else {
                    document.getElementById("markerClickMsg").toggle();
                }
            }
        });

        $scope.showMap = function (siteId, lat, long, zoom) {
            $scope.selectedSiteId = "";
            $scope.selectedSiteId = siteId;
            console.log("siteid", siteId)
            console.log("lat", lat);
            console.log("lng", long);
            console.log("zoom", zoom);
            $scope.showMapPx = true;
            $scope.$digest();
            map.notifyResize();
            map.setAttribute("latitude", lat);
            map.setAttribute("longitude", long)
            map.setAttribute("zoom", zoom);
            var fetchBoundaryJSON = {
                "siteId": $scope.selectedSiteId,
                "startDate": "",
                "expiryDate": ""
            }

            fetchService.fetchBoundry(fetchBoundaryJSON).success(function (data) {
                
                $http.get("https://ds-admin-microservice-dev.run.aws-usw02-pr.ice.predix.io/getWeather?latitude=" + lat + "&longitude=" + long)
                    .success(function (weatherResponse) {
                        //console.log("data",data);
                        //console.log("weatherResponse",weatherResponse);
                        var siteBoundryList = data.siteBoundryList;
                        createSiteBoundry(siteBoundryList);
                        $scope.existingBoundry = data.siteBoundryList;
                        var zoneList = data.zoneList;
                        var summary = weatherResponse.hourly.summary;
                        var thresholdRainfallfromAPI = "";


                        if (summary.indexOf("drizzle") != -1 || summary.indexOf("light") != -1 || summary.indexOf("Drizzle") != -1 ||
                            summary.indexOf("Light") != -1) {
                            //                 console.log(summary.indexOf("Drizzle"),summary.indexOf("Light"));
                            thresholdRainfallfromAPI = "light rain"
                        }

                        else if (summary.indexOf("breezy") != -1 || summary.indexOf("cloudy") != -1 || summary.indexOf("Cloudy") != -1 ||
                            summary.indexOf("Breezy") != -1) {
                            //                console.log(summary.indexOf("breezy"),summary.indexOf("cloudy"));
                            thresholdRainfallfromAPI = "cloudy"
                        }

                        else if (summary.indexOf("heavy") != -1 || summary.indexOf("Heavy") != -1 || summary.indexOf("Rain") != -1 ||
                            summary.indexOf("rain") != -1) {
                            //                console.log(summary.indexOf("heavy"),summary.indexOf("Heavy"),summary.indexOf("rain"),summary.indexOf("Rain"));
                            thresholdRainfallfromAPI = "heavy rain"
                        }
                        $scope.thresholdRainfallfromAPI = thresholdRainfallfromAPI
                        createZones(zoneList, thresholdRainfallfromAPI, "latLngList");
                    });
            })
            $scope.firstTime = true;
        }

        $scope.deleteSite = function (siteId) {
            $scope.deleteSiteId = "";
            $scope.deleteSiteId = siteId;
            console.log($scope.deleteSiteId);


            PostService.deleteSite($scope.deleteSiteId).success(function (data) {
                console.log("Site deleted");
                fetchSiteData();
            })
        }

        function createSiteBoundry(siteBoundryList) {
            storeLatLng(siteBoundryList);
            console.log("siteBoundryList", siteBoundryList);
            var poly = document.createElement('google-map-poly');
            poly.setAttribute("id", "boundryPoly")
            poly.setAttribute('closed', '');
            poly.setAttribute('fill-color', '#418bca')
            poly.setAttribute('stroke-weight', '1')
            poly.setAttribute('fill-opacity', '.25')
            Polymer.dom(map).appendChild(poly);
            
            for (var i = 0; i < siteBoundryList.length; i++) {
                var polyPoint = document.createElement('google-map-point');
                polyPoint.setAttribute('latitude', siteBoundryList[i].latitude);
                polyPoint.setAttribute('longitude', siteBoundryList[i].longitude);
                Polymer.dom(poly).appendChild(polyPoint);
            }
        }

        function createZones(zoneList, thresholdRainfallfromAPI, latlngListKEY) {
            //            console.log("zoneList",zoneList)
            console.log(zoneList.length);
            for (var i = 0; i < zoneList.length; i++) {
                var isLowLying = false;
                var zonePoly = document.createElement('google-map-poly');
                zonePoly.setAttribute('closed', '');
                zonePoly.setAttribute('stroke-weight', '1')
                zonePoly.setAttribute('fill-opacity', '.50')
                if (zoneList[i].lowLyingArea == "yes") {
                    isLowLying = checkLowLyingZone(zoneList[i], thresholdRainfallfromAPI)
                }
                if (isLowLying) {
                    zonePoly.setAttribute('fill-color', 'yellow')
                    zonePoly.setAttribute('id', "zone-" + zoneList[i].siteZoneId);
                }
                else {
                    if (zoneList[i].zoneType == "Safe Assembly Zone") {
                        zonePoly.setAttribute('fill-color', 'green')
                        zonePoly.setAttribute('id', "zone-" + zoneList[i].siteZoneId);
                    }
                    if (zoneList[i].zoneType == "Danger Zone") {
                        zonePoly.setAttribute('fill-color', 'red')
                        zonePoly.setAttribute('id', "zone-" + zoneList[i].siteZoneId);
                    }
                }

                if (latlngListKEY == "gpsTransactionEntityList") {
                    if (isLowLying) {
                        zonePoly.setAttribute('fill-color', 'yellow')
                        zonePoly.setAttribute('id', "zone-" + zoneList[i].siteZoneId);
                    }
                    else if ($scope.selectedZone == "Safe Assembly Zone") {
                        zonePoly.setAttribute('fill-color', 'green')
                        zonePoly.setAttribute('id', "zone-" + zoneList[i].siteZoneId);
                    }
                    else if ($scope.selectedZone == "Danger Zone") {
                        zonePoly.setAttribute('fill-color', '#FA8072')
                        zonePoly.setAttribute('id', "zone-" + zoneList[i].siteZoneId);
                    }

                }
                console.log("zoneList", zoneList)
                var marker = document.createElement('google-map-marker');
                marker.setAttribute("latitude", zoneList[i].latitude);
                marker.setAttribute("longitude", zoneList[i].longitude);
                marker.setAttribute('title', zoneList[i].zoneType);
                marker.setAttribute('id', zoneList[i].siteZoneId);
                /* marker.setAttribute("icon","/images/Marker_1.png");*/

                if ($scope.selectedZone == "Danger Zone") {
                    marker.setAttribute("icon", "/images/Marker_2.png");
                }

                else if ($scope.selectedZone == "Safe Assembly Zone") {
                    marker.setAttribute("icon", "/images/Marker_1.png");
                }

                marker.setAttribute('click-events', 'true');
                Polymer.dom(map).appendChild(marker);

                var latlngList = zoneList[i][latlngListKEY];
                if (latlngList != undefined) {
                    for (var j = 0; j < latlngList.length; j++) {
                        var polyPoint = document.createElement('google-map-point');
                        polyPoint.setAttribute('latitude', latlngList[j].latitude);
                        polyPoint.setAttribute('longitude', latlngList[j].longitude);
                        Polymer.dom(zonePoly).appendChild(polyPoint);
                    }
                }
                Polymer.dom(map).appendChild(zonePoly);
            }
        }

        $scope.drawMarker = function () {
            $scope.addSiteBoundryMarker = true;
            $scope.zoneSelected = false;
            $scope.inEditZone = false;
            map.setAttribute('click-events', 'true');
            $scope.resetDisable = true;
        }

        function checkLowLyingZone(data, thresholdRainfallfromAPI) {
            var islowlying = false;
            if (thresholdRainfallfromAPI == "heavy rain") {
                islowlying = true;
            }
            else if (thresholdRainfallfromAPI == "light rain") {
                if (data.thresholdRainfall == "light rain" || data.thresholdRainfall == "cloudy") islowlying = true
            }
            else if (thresholdRainfallfromAPI == "cloudy") {
                if (data.thresholdRainfall == "cloudy") islowlying = true
            }
            return islowlying
        }

        $scope.radioClicked = function (clickedButton) {
            //console.log("clicked",clickedButton)
            if (clickedButton == "sitePerimeter") {
                //$scope.resetDisable = true;
                console.log($scope.existingBoundry);
                if ($scope.existingBoundry == "") {

                    if ($scope.siteSwitch) {

                        if ($scope.siteExists) {

                            $scope.addSiteBoundryMarker = false;
                            $scope.zoneSelected = false;
                            $scope.inEditZone = false;

                            $scope.resetDisable = false;
                        }
                        else {

                            $scope.addSiteBoundryMarker = true;
                            $scope.zoneSelected = false;
                            $scope.inEditZone = false;

                            $scope.resetDisable = true;
                        }

                        //$scope.resetDisable = false;
                        //document.getElementById("welcomeSitePerimeterMsg").toggle();

                    }
                    else {
                        $scope.resetDisable = false;
                        if ($scope.firstTime) {
                            $scope.drawMarker();
                            //document.getElementById("welcomeSitePerimeterMsgFirst").toggle();
                            $scope.firstTime = false;
                        }

                        // else{
                        //      document.getElementById("siteBoundryMsg").toggle();

                        // }                   
                    }
                }
                else {
                    $scope.resetDisable = false;
                    $scope.addSiteBoundryMarker = false;
                    $scope.zoneSelected = false;
                    $scope.inEditZone = false;
                    map.setAttribute('click-events', 'true');
                    document.getElementById("alreadySitePerimeterExist").toggle();
                }

                // if ($scope.siteSwitch) {
                //     if ($scope.siteExists) {
                //         $scope.addSiteBoundryMarker = false;
                //         $scope.zoneSelected = false;
                //         $scope.inEditZone = false;
                //     } else {
                //         $scope.addSiteBoundryMarker = true;
                //         $scope.zoneSelected = false;
                //         $scope.inEditZone = false;
                //     }

                //     $scope.resetDisable = false;
                //     document.getElementById("welcomeSitePerimeterMsg").toggle();
                // }
                // else {
                //     $scope.resetDisable = false;
                //     if ($scope.firstTime) {
                //         document.getElementById("welcomeSitePerimeterMsgFirst").toggle();
                //         $scope.firstTime = false;
                //     }
                //     // else{
                //     //      document.getElementById("siteBoundryMsg").toggle();

                //     // }                   
                // }
                $scope.siteSwitch = false;

            }
            if (clickedButton == "siteZone") {
                //document.getElementById("ZoneBoundryMsg").toggle();
                $scope.CreateZone = false;
                $scope.EditZone = false;
                $scope.zoneSelected = false;
                $scope.addSiteBoundryMarker = false;
                $scope.inEditZone = false;
                $scope.siteSwitch = true;

            }
        }

        $scope.radioClick = function (clickButton) {
            console.log("clicked", clickButton)
            $scope.clickButtonValue = clickButton;
            // if (clickButton == "yes") {
            //     //document.getElementById("zoneWeatherMsg").toggle();
            // }
            // if (clickButton == "no") {

            // }
        }

        var time = ".00 IST";
        var effectiveDate = '', endDate = '';

        $scope.selectAction = function (myZone) {

            if (myZone == "Danger Zone" || myZone == "Safe Assembly Zone") {

                $scope.selectedZone = myZone;
                map.setAttribute('click-events', 'true');
                $scope.zoneSelected = true;
                $scope.addSiteBoundryMarker = false;
                $scope.inEditZone = false;
                $scope.showCreateTable = true;
            }


        }

        $scope.ZoneClicked = function (create, edit, fromMarker) {
            console.log("qweqwey",create, edit, fromMarker);
            if (edit && !(fromMarker)) {
                console.log("inside ZoneClicked if...")
                document.getElementById("zoneBoundryMsg").toggle();
            }
            else if (create && !(fromMarker)) {
                document.getElementById("zoneCenterMsg").toggle();
            }
            $scope.CreateZone = create;
            $scope.EditZone = edit;

            //PX

            //         document.getElementById("effectiveDate").addEventListener("px-datetime-submitted", function(e) {
            //
            //		 // console.log("start",e);
            //            var start = e.detail.momentObj._d.toString().substring(4,24).concat(time);
            //            
            //           console.log("start",start);
            //            effectiveDate = start;//"Mar 24 2016 00:00:00.00 IST";////e.detail.dateTime;
            //         });  
            //           document.getElementById("endDate").addEventListener("px-datetime-submitted", function(e) {
            //
            //		 // console.log("start",e);
            //            var end = e.detail.momentObj._d.toString().substring(4,24).concat(time);
            //            
            //           console.log("end",end);
            //            endDate = end;//"Mar 24 2016 00:00:00.00 IST";////e.detail.dateTime;
            //         });  

            $scope.showCreateTable = true;
            $scope.$digest();
        }

        $scope.saveCenter = function () {


            var thresholdRainfall = "";
            //***************************************

            var startPx = document.getElementById("effectiveDate").dateTime;

            var startPxDate = startPx.slice(0, -5).concat("EST");
            //    console.log("startdATE", startPxDate);
            //var x="2011-01-28T19:30:00"

            var MM = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            startDate = startPxDate.replace(
                /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):\d{2}(\w{3})/,
                function ($0, $1, $2, $3, $4, $5, $6) {
                    return MM[$2 - 1] + " " + $3 + " " + $1 + " " + $4 + ":" + $5 + ":00.00 IST"
                }
            )

            //        console.log("finalStartDate",startDate);

            //            console.log("buttonvalue",$scope.clickButtonValue);

            if ($scope.clickButtonValue == "yes") {
                thresholdRainfall = document.getElementById("weather").value;
                //          console.log("Dropdown value",document.getElementById("weather").value);
            }
            ///////////////End Date/////////////////

            var endPx = document.getElementById("endDate").dateTime;

            var endPxDate = endPx.slice(0, -5).concat("EST");
            //    console.log("startdATE", startPxDate);
            //var x="2011-01-28T19:30:00"

            var MM = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            endDate = endPxDate.replace(
                /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):\d{2}(\w{3})/,
                function ($0, $1, $2, $3, $4, $5, $6) {
                    return MM[$2 - 1] + " " + $3 + " " + $1 + " " + $4 + ":" + $5 + ":00.00 IST"
                }
            )

            //        console.log("finalEndDate",endDate);

            //*******************************



            var lat = document.getElementById("lat").value;
            var lng = document.getElementById("long").value
            var zoneName = document.getElementById("zoneName").value

            var zoneCenterJSON =
                //            {
                //                "zoneList" :[{
                //                    "name" :  zoneName,
                //                    "latitude" :lat,
                //                    "longitude" :lng,
                //                    "Title" : $scope.selectedZone,
                //                    "latlngList": []
                //                }]    
                //                                            
                //            }
                {
                    "siteZoneId": 0,
                    "siteId": $scope.selectedSiteId,
                    "markerLatitude": lat,
                    "markerLongitude": lng,

                    "latLngList": [

                    ],
                    "title": zoneName,
                    "requestType": "WebApi",
                    "alertMsg": "",
                    "zoneType": $scope.selectedZone,
                    "lowLyingArea": $scope.clickButtonValue,
                    "thresholdRainfall": thresholdRainfall,
                    "expiryDate": endDate,
                    "startDate": startDate,
                    "submitType": "new",
                    "deviceSrNo": "",
                    "username": "",
                    "deviceId": "",
                    "contractorId": 0,
                    "datatype": "Zone"
                }

            console.log("zoneCenterJSON: ", zoneCenterJSON)
            PostService.addZone(zoneCenterJSON).success(function (responseZone) {

                console.log(responseZone);
                //                console.log("addZone",responseZone);
                var response = responseZone.zoneMarkerDetails;
                var marker = document.createElement('google-map-marker');
                marker.setAttribute("latitude", response[0].markerlatitude);
                marker.setAttribute("longitude", response[0].markerlongitude);
                marker.setAttribute('title', responseZone.zoneType);
                marker.setAttribute('id', response[0].siteZoneId);
                var zoneName = document.getElementById("zoneName").value;
                marker.setAttribute("icon", "/images/Marker_1.png");
                console.log("zoneflag", $scope.selectedZone);
                if ($scope.selectedZone == "Danger Zone") {
                    marker.setAttribute("icon", "/images/Marker_2.png");
                }

                else if ($scope.selectedZone == "Safe Assembly Zone") {
                    marker.setAttribute("icon", "/images/Marker_1.png");
                }
                marker.setAttribute('click-events', 'true');
                Polymer.dom(map).appendChild(marker);

            });
            $scope.centerClearValue();
            $scope.CreateZone = false;
            document.getElementById("saveCentrePointMsg").toggle();
            $scope.myZone = { id: "safeZone", name: "Safe Assembly Zone" };

        }
        $scope.myZone = { id: "dangerZone", name: "Danger Zone" };

        window.addEventListener('google-map-marker-click', function (e) {
            console.log(e);
            $scope.addSiteBoundryMarker = false;
            $scope.zoneSelected = false;
            $scope.inEditZone = true;
            $scope.zoneLatLngList = []
            var srcElement1 = e.srcElement;
            var id = srcElement1.getAttribute('id');
            console.log(id);
            var title = srcElement1.getAttribute('title');
            $scope.zoneId = id;
            $scope.selectedZone = title;
            //            console.log("ud",id,"title",title);
            for (var i = 0; i < $scope.myZones.length; i++) {
                if ($scope.myZones[i].name == title) $scope.myZone = $scope.myZones[i];
            }
            //            document.getElementById("zoneDeleteMsg").toggle();
            var zonetoRemove = document.getElementById("zone-" + id)
            /*            if(zonetoRemove != undefined){
                            Polymer.dom((Polymer.dom(zonetoRemove).parentNode)).removeChild(zonetoRemove);
                        }*/
            var fromMarker = true;
            $scope.ZoneClicked(false, true, fromMarker);
        });

        $scope.deleteDialog = function () {
            // if (lat == "" && lng == "") {
            //     document.getElementById("selectZoneMarkerMsg").toggle();
            // }
            document.getElementById("zoneDeleteMsg").toggle();

        }

        $scope.deleteZone = function (submitType) {
            //            document.getElementById("zoneEditMsg").toggle();
            var markerId = "";
            var deleteType = "boundary";
            var zonetoRemove = document.getElementById("zone-" + $scope.zoneId);
            console.log("zonetoRemove",zonetoRemove);
            console.log("zone-" + $scope.zoneId);
            if (zonetoRemove != undefined) {
                Polymer.dom((Polymer.dom(zonetoRemove).parentNode)).removeChild(zonetoRemove);
                $scope.markZone();
            }

            if (submitType == "delete") {

                var markerId = document.getElementById($scope.zoneId);
                console.log($scope.zoneId);

                if (markerId == null) {
                    document.getElementById("selectZoneMarkerMsg").toggle();
                }
                console.log("Marker ID is:", markerId);

                var deleteType = "all";
                Polymer.dom((Polymer.dom(markerId).parentNode)).removeChild(markerId);
                Polymer.dom.flush();
            }
            var deleteZoneJSON = {
                "siteZoneId": $scope.zoneId,
                "submitType": "delete",
                "requestType": "WebApi",
                "toDelete": deleteType
            }
            console.log(deleteZoneJSON);
            PostService.addZone(deleteZoneJSON).success(function (deleteZoneResponse) {
                console.log("deleteZoneResponse", deleteZoneResponse);
            })
        }

        $scope.toggleMap = () => {
            var mapToggled = document.getElementById("showMap")
            mapToggled.toggle();

            var map = new google.maps.Map(document.getElementById('selectLocation'), {
                center: { lat: -33.8688, lng: 151.2195 },
                zoom: 13,
                mapTypeId: 'roadmap'
            });

            document.getElementById('selectLocation').addEventListener('mouseover', function () {
                google.maps.event.trigger(map, "resize");
            });

            // Create the search box and link it to the UI element.
            var pac_input = '<input id="pac-input" type="text" placeholder="Search Box">';
            $(pac_input).appendTo("#inputWrapper");

            var input = document.getElementById('pac-input');
            var searchBox = new google.maps.places.SearchBox(input);
            map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

            // Bias the SearchBox results towards current map's viewport.
            map.addListener('bounds_changed', function () {
                searchBox.setBounds(map.getBounds());
            });

            var markers = [];
            // Listen for the event fired when the user selects a prediction and retrieve
            // more details for that place.
            searchBox.addListener('places_changed', function () {
                var places = searchBox.getPlaces();

                if (places.length == 0) {
                    return;
                }

                // Clear out the old markers.
                markers.forEach(function (marker) {
                    marker.setMap(null);
                });
                markers = [];

                // For each place, get the icon, name and location.
                var bounds = new google.maps.LatLngBounds();
                places.forEach(function (place) {
                    if (!place.geometry) {
                        console.log("Returned place contains no geometry");
                        return;
                    }

                    if (place.geometry.viewport) {
                        // Only geocodes have viewport.
                        bounds.union(place.geometry.viewport);
                    } else {
                        bounds.extend(place.geometry.location);
                    }
                });
                map.fitBounds(bounds);
            });
            google.maps.event.addListener(map, 'click', function (event) {

                console.log("===================", event);
                var latitude = event.latLng.lat().toFixed(7);
                var longitude = event.latLng.lng().toFixed(7);
                console.log(latitude);
                console.log(longitude);
                document.getElementById('siteLat').setAttribute('value', latitude);
                document.getElementById('siteLng').setAttribute('value', longitude);

                mapToggled.close();
                // getWeatherData(latitude, longitude);
            })

            document.getElementById('selectLocation').addEventListener('google-map-click', function (e) {
                console.log("lat", e.detail.latLng.lat());
                console.log("lng", e.detail.latLng.lng())
            });

            google.maps.event.trigger(map, "resize");

            //   $("#showMap").draggable({
            //   handle: ".modal-header"
            //   });

            // function getWeatherData(latitude, longitude) {
            //     var URL = 'https://api.darksky.net/forecast/b2cc7e80877748a769503a65480e3d90/' + latitude + ',' + longitude;
            //     console.log(URL);
            //     $http.get(URL).success((responseData) => {
            //         console.log(responseData);
            //     })
            // }
        }

        $scope.addSite = function () {
            document.getElementById("addSiteDialog").toggle();
        }

        $scope.resetSiteBoundryMsg = function () {
            document.getElementById("resetSiteAlert").toggle();
        }

        $scope.resetSiteBoundry = function () {
            //$scope.siteSwitch = false;
            $scope.countMarkerSite = 0;
            $scope.siteExists = false;
            $scope.resetDisable = true;
            var deleteBoundryJSON = {
                "siteId": $scope.selectedSiteId,
                "requestType": "WebApi",
                "submitType": "delete"
            }
            console.log(deleteBoundryJSON)
            PostService.addBoundry(deleteBoundryJSON).success(function (response) {
                console.log(response);
                $scope.existingBoundry = [];
            })
            $scope.addSiteBoundryMarker = true;
            $scope.zoneSelected = false;
            $scope.inEditZone = false;
            map.setAttribute('click-events', 'true');
            var boundryPoly = document.getElementById("boundryPoly");
            Polymer.dom((Polymer.dom(boundryPoly).parentNode)).removeChild(boundryPoly);
        }

        $scope.saveBoundry = function () {
            console.log($scope.existingBoundry);

            if ($scope.existingBoundry == "") {
                // $scope.errorMessageSite = "Please Draw Site Using Markers";

                if ($scope.countMarkerSite > 2) {
                    
                    // $scope.showError = false;
                    $scope.resetDisable = false;
                    $scope.siteExists = true;

                    var markerarr = new Array();
                    markerarr = map.markers;
                    console.log("markerarr ... ",markerarr);
                    if (!(markerarr == undefined)) {
                        for (var i = 0; i < markerarr.length; i++) {
                            console.log("id", markerarr[i].getAttribute("id"))
                            if (markerarr[i].getAttribute("id") == "siteBoundryMarkers") {
                                Polymer.dom((Polymer.dom(markerarr[i]).parentNode)).removeChild(markerarr[i]);
                                Polymer.dom.flush();
                            }
                        }
                    }

                    var saveBoundryJSON =
                        {
                            "deviceSrNo": "0",
                            "username": "ABC",
                            "deviceId": 0,
                            "contractorId": 0,
                            "siteId": $scope.selectedSiteId,
                            "datatype": "Boundary",
                            "requestType": "WebApi",
                            "latLngList": $scope.boundryLatLngList,
                            "createdBy": "Admin",
                            "submitType": "new",
                            "siteZoneId": 0,
                            "zoneType": "Danger"
                        }
                    console.log("saveBoundryJSON", saveBoundryJSON)
                    PostService.addBoundry(saveBoundryJSON).success(function (response) {
                        console.log(response);
                        createSiteBoundry(response.gpsTransactionEntityList);
                        $scope.existingBoundry = response.gpsTransactionEntityList;
                    })
                    $scope.boundryLatLngList = [];

                    document.getElementById("saveBoundryMsg").toggle();
                    $scope.addSiteBoundryMarker = false;
                    $scope.zoneSelected = false;
                    $scope.inEditZone = false;
                   
                }
                else {
                    document.getElementById("errorMSg").toggle();
                    // $scope.showError = true;
                    // $scope.errorMessageSite = "Please Select More than two markers"
                }
            }

        }

        $scope.editZoneBoundry = function () {
            /*$scope.addSiteBoundryMarker=false;*/
            $scope.addSiteBoundryMarker = false;
            $scope.zoneSelected = false;
            $scope.inEditZone = true;
        }

        $scope.updateZone = function () {

            var markerarr = new Array();
            markerarr = map.markers;
            if (!(markerarr == undefined)) {
                for (var i = 0; i < markerarr.length; i++) {
                    //                    console.log("id",markerarr[i].getAttribute("id"))
                    if (markerarr[i].getAttribute("id") == "zoneBoundryMarkers") {
                        Polymer.dom((Polymer.dom(markerarr[i]).parentNode)).removeChild(markerarr[i]);
                        Polymer.dom.flush();
                    }
                }

            }
            var saveZoneJSON =
                {
                    "siteZoneId": $scope.zoneId,
                    "siteId": $scope.selectedSiteId,
                    "latLngList": $scope.zoneLatLngList,
                    "zoneType": $scope.selectedZone,
                    "requestType": "WebApi",
                    "submitType": "new",
                    "datatype": "Zone",
                    //                  "thresholdRainfall":$scope.thresholdRainfall
                }
            console.log("saveZoneJSON", saveZoneJSON)
            PostService.addZone(saveZoneJSON).success(function (response) {
                console.log("response", response)
                createZones(response.zoneMarkerDetails, $scope.thresholdRainfallfromAPI, "gpsTransactionEntityList")
            })
            $scope.addSiteBoundryMarker = false;
            $scope.zoneSelected = false;
            $scope.inEditZone = false;

        }

        $scope.isActiveFlag = false;
        document.querySelector('paper-checkbox').addEventListener("change", function (e) {
            //                console.log("checkbox",e.target.__data__.checked);
            $scope.isActiveFlag = e.target.__data__.checked;

        });

        var clearValues = function () {
            document.getElementById('locDropDown').displayValue = "Select Location";
            document.getElementById("siteName").value = '';
            document.getElementById("siteDesc").value = '';
            document.getElementById("siteLat").value = '';
            document.getElementById("siteLng").value = '';
            document.getElementById("siteZoom").value = '';
            document.getElementById("siteActive").checked = false;
        }
        $scope.clearSite = function() {
            clearValues();
			$scope.errorMessage = "";
        }
        $scope.saveNewSite = function () {

            var lat = document.getElementById("siteLat").value;
            var long = document.getElementById("siteLng").value;

            if ((document.getElementById("siteName").value == '') || (document.getElementById("siteDesc").value == '') || (document.getElementById("siteLat").value = '') || (document.getElementById("siteLng").value = '') || (document.getElementById("siteZoom").value == '')) {

                $scope.errorMessage = "Please fill all the required fields";

                /* document.getElementById("addSiteName").toggle();*/
                document.getElementById("addSiteDialog").toggle();
                //return false;
                clearValues();
            }
            else {

                $scope.errorMessage = '';
                var activeFlag = ""
                if ($scope.isActiveFlag == true) {
                    activeFlag = "Y"
                }
                else {
                    activeFlag = "N"
                }
                var saveSiteJSON =
                    {
                        "siteName": document.getElementById("siteName").value,
                        "description": document.getElementById("siteDesc").value,
                        "locationId": $scope.locationValue.locationId,
                        "defaultLang": 1,
                        "timezone": 1,
                        "isActive": activeFlag,
                        "createdBy": "admin",
                        "latitude": lat,
                        "longitude": long,
                        "zoom": document.getElementById("siteZoom").value,
                        "submitType": "new"
                    }
                console.log("saveSiteJSON", saveSiteJSON)
                PostService.addSite(saveSiteJSON).success(function (data) {
                    console.log("datasaveSITE", data);

                    data["locationId"] = $scope.locationValue.locationId;
                    data["locationName"] = $scope.locationValue.locationName;
                    $scope.showDetails(data);
                })
            }
            clearValues();
        }

        $scope.centerClearValue = function () {
            console.log($scope.clickButtonValue);
            if ($scope.clickButtonValue == "yes") {
                document.getElementById('selectZoneYesRadio').checked = false;
                document.getElementById('selectZoneAreaYes').selected = true;
            } else if ($scope.clickButtonValue == "no") {
                document.getElementById('selectZoneNoRadio').checked = false;
            }
            document.getElementById('selectZoneDefault').selected = true;

            document.getElementById('lat').value = "";
            document.getElementById('long').value = "";
            document.getElementById('zoneName').value = "";
            document.getElementById('zoneName').label = "Site Name";
        }

        $scope.showDetails = function (data) {
            var tempData = JSON.parse(JSON.stringify($scope.finalData));
            $scope.finalData = [];
            $timeout(function () {
                if(data.isActive=='Y'){
                tempData.splice(0, 0, data);}
                showSiteinTable(tempData)
            }, 500);
        }


        pxtable.addEventListener("after-save", function (e) {
            //            console.log(e.detail.row.row)

            var updateSiteJSON = {
                "siteId": e.detail.row.row.siteId.value,
                "siteName": e.detail.row.row.siteName.value,
                "description": e.detail.row.row.description.value,
                "locationId": e.detail.row.row.locationId.value,
                "defaultLang": e.detail.row.row.defaultLang.value,
                "timezone": e.detail.row.row.timezone.value,
                "isActive": e.detail.row.row.isActive.value,
                "updatedBy": e.detail.row.row.updatedBy.value,
                "latitude": e.detail.row.row.latitude.value,
                "longitude": e.detail.row.row.longitude.value,
                "zoom": e.detail.row.row.zoom.value,
                "submitType": "update"
            }
            //            console.log("updateSiteJSON",updateSiteJSON)
            PostService.addSite(updateSiteJSON).success(function (data) {
                //                console.log("data",data);
            })
        });

        $scope.markZone = function () {
            map.setAttribute("click-events", "true");
            $scope.inEditZone = true;
        }


        $scope.logOut = function () {

            window.location.assign("https://fcb7ec9a-3d36-4fb6-9ed2-7c5e7d671f11.predix-uaa.run.aws-usw02-pr.ice.predix.io/login");
            console.log("Logged Out Suceesfully");
        }

        function storeLatLng(boundryLatLngList) {
            $scope.latList = []; $scope.lngList = [];
            for (var i = 0; i < boundryLatLngList.length; i++) {
                $scope.latList[i] = parseFloat(boundryLatLngList[i].latitude);
                $scope.lngList[i] = parseFloat(boundryLatLngList[i].longitude);
            }

        }
        function pnpoly(xp, yp, x, y) {
            var i, j, c = 0, npol = xp.length;
            for (i = 0, j = npol - 1; i < npol; j = i++) {
                if ((((yp[i] <= y) && (y < yp[j])) ||
                    ((yp[j] <= y) && (y < yp[i]))) &&
                    ((x < (xp[j] - xp[i]) * (y - yp[i]) / (yp[j] - yp[i]) + xp[i]))) {
                    c = !c;

                }
            }
            return c;
        }



    }]);
});
