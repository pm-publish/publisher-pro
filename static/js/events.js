import { View, Modal, Server, PubSub } from './framework'
import Handlebars from 'handlebars'
import { Templates } from './article-templates'
import { Form, Validators } from './form'
export const ListingForm = function() {};
ListingForm.prototype = new Form(Validators);
ListingForm.constructor = ListingForm;

    ListingForm.prototype.clearErrorHightlights = function()
    {
        $("#formerror").removeClass('active');
        for (var field in this.compulsoryFields) {
            var fieldname = this.compulsoryFields[field].split('.').reverse()[0];
            $('#'+fieldname).removeClass('formError');
        }
    };
    ListingForm.prototype.addErrorHightlights = function()
    {
        if (this.errorFields.length > 0) {
            $("#formerror").addClass('active');
        }
        for (var field in this.errorFields) {
            $('#'+this.errorFields[field]).addClass('formError');
        }
    };
    ListingForm.prototype.saveImage = function(r, data)
    {
        let media = r.media;
        if (r.media.constructor !== Array) {
            media = [r.media];
        }
        if (data.constructor !== Array) {
            data = [data];
        }

        var mediaids = [];
        if (this.data.media_ids != "") {
            mediaids = this.data.media_ids.split(',');
        }

        for (let i = 0; i<media.length; i++) {
            const id = media[i].media_id;
            data[i].media_id = id;
            mediaids.push(id);
            this.mediaArr.push(id);
        }
        this.data.media_ids = mediaids.join(',');
        this.data.media_id = mediaids[0];
        this.renderImageThumbs(media);
        return true;
    };
    ListingForm.prototype.deleteImage = function(data) 
    {
        var elem = data.elem;
        var id = data.id;
        elem.parent().remove();

        const mediaids = this.data.media_ids.split(',');
        var index = mediaids.indexOf(id.toString());
        if (index > -1) {
            mediaids.splice(index, 1);
        }
        
        if (mediaids.length > 0) {
            this.data.media_id = mediaids[0];
            this.data.media_ids = mediaids.join(',');
        } else {
            this.data.media_id = '';
            this.data.media_ids = '-1';
        }

    };
    ListingForm.prototype.renderImageThumbs = function(images) 
    {
        var imageArray = $('#imageArray');
        var html = "";
        var temp = Handlebars.compile(Templates.carousel_item); 
        for (var i=0;i<images.length;i++) {
            const imagePath = images[i].thumb_url;
            const params = {
                "imagePath": imagePath, 
                'imageid' : images[i].media_id,
                'swap' : images.length > 1 ? 'swap-image' : ""
            };
            html += temp(params);
        }
        imageArray.append(html);
        if (this.mediaArr.length > 1) {
            this.initSortable();
        }
    };
    ListingForm.prototype.initSortable = function()
    {
        var self = this;

        $( "#imageArray" ).sortable({
            self: self,
            axis: "x", // only sort horizontal
            update: function(e, ui) {
                var data = {
                    articleGuid: self.data.guid,
                    images: []
                };
                var container = $(e.target);

                var images = container.children();
                images.each(function(i,e) {
                    var id = $(e).find('span').data('id');
                    data.images.push(id);
                });

                Server.create('/api/article/reorder-article-media', data).done(function(r) {
                    if (r.success == 1) {
                        images.css({outline: '0 solid rgba(167, 237, 52, 1)' })
                        images.animate({
                            "outlineWidth": 4
                        }, 100).animate({
                            "outlineWidth": 0
                        }, 100, function() {
                            $(this).removeAttr('style');
                        });
                    }
                });
            }
        });
    };
    ListingForm.prototype.clear = function(images) 
    {
        console.log('clearing the form');
        // if (this.menus) {
        //     var menus = Object.keys(this.menus);
        //     for(var i=0;i<menus.length;i++) {
        //         this.menus[menus[i]].reset();
        //     }
        // }
        $('#imageArray').empty();
        this.clearErrorHightlights();
        const errorElem = document.getElementById('formError');
        errorElem.innerText = '';

        this.data = {
            'id': 0,
            'blogs': this.blogId,
            'media_ids': ''
        };
    };
    ListingForm.prototype.submit = function()
    {

        var self = this;
        var validated = this.validate();
        if (!validated) {
            this.render();
            return;
        }

        this.data.theme_layout_name = this.layout;

        const spinner = new Modal('modal', 'swap-modal', { "spinner" : 'spinnerTmpl' } );                
        spinner.render("spinner", "");
        console.log(this.data);
        Acme.server.create('/api/article/create', this.data).done(function(r) {
            spinner.closeWindow();
            // console.log(r);
            if (r.success === 1) {
                const page_container = document.getElementById('event-container');
                
                const temp = Handlebars.compile(Templates.eventThankYou);
                page_container.innerHTML = temp({
                    thankYouText: self.thankYouText,
                    home_link: _appJsConfig.appHostName,
                    events_link: _appJsConfig.appHostName + "/events"
                });
                window.scrollTo(0,0);
                return;
            }
            self.showError(r.error);

        }).fail(function(r) {
            // console.log(r);
            spinner.closeWindow();
            self.showError(r.responseJSON.error);
        });
    };

    ListingForm.prototype.showError = function(error) {
        let errors = [];
        for (let key in error) {
            for (let i = 0; i< error[key].length; i++) {
                errors.push(error[key][i]);
            }
        }

        const errorElem = document.getElementById('formError');
        errorElem.innerText = errors.join(', ');
    }



export const EventForm = function(id, blogId) 
{
    this.id = id || null;
    this.parent = Form.prototype;

    this.errorFields = [];

    this.validateRules = {
        "title"         : ["notEmpty"],
        "start_date"    : ["notEmpty"], 
        "content"       : ["notEmpty"], 
        "contact_email" : ["notEmpty"], 
        "contact_name"  : ["notEmpty"],
    };    
    
    this.validateFields = Object.keys(this.validateRules);

    this.blogId = blogId;
    
    this.mediaArr = [];

    this.data = {
        'id': 0,
        'blogs': this.blogId,
        'media_ids': '',
        'type': 'event'
    };



    // We prefill the form with the logged in users name so we'll
    // add it to the data so form errors don't get triggered on those fields
    const emailElem = document.getElementById('contact_email');
    const nameElem = document.getElementById('contact_name');
    if (emailElem.value !== "") {
        this.data.contact_email = emailElem.value;
    }
    if (nameElem.value !== "") {
        this.data.contact_name = nameElem.value;
    }


    this.events();
    this.events2();
};
    EventForm.prototype = new ListingForm();
    EventForm.prototype.constructor=Acme.EventForm;
    EventForm.prototype.formatDate = function(date) {
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() 
    };
    EventForm.prototype.events2 = function() {
        const self = this;

        const startDateElem = document.getElementById('start_date');
        const endDateElem = document.getElementById('end_date');
        const _ = new tempusDominus.TempusDominus(startDateElem, {
            display: {
                icons: {
                    time: "fa fa-clock-o",
                    date: "fa fa-calendar",
                    up: "fa fa-angle-up",
                    down: "fa fa-angle-down",
                    next: "fa fa-angle-right",
                    previous: "fa fa-angle-left"
                }
            }
        });
        const pickerEnd = new tempusDominus.TempusDominus(endDateElem, {
            display: {
                icons: {
                    time: "fa fa-clock-o",
                    date: "fa fa-calendar",
                    up: "fa fa-angle-up",
                    down: "fa fa-angle-down",
                    next: "fa fa-angle-right",
                    previous: "fa fa-angle-left"
                }
            }
        });
        startDateElem.addEventListener("keypress", (e) => {
            e.preventDefault();
        });
        endDateElem.addEventListener("keypress", (e) => {
            e.preventDefault();
        });

        startDateElem.addEventListener(tempusDominus.Namespace.events.change, (e) => {

            if (typeof e.detail.date !== 'undefined') {
                self.data.start_date = self.formatDate(e.detail.date);
                pickerEnd.updateOptions({
                    defaultDate: e.detail.date,
                    restrictions: {
                        minDate: e.detail.date,
                    }
                });
                const valid = self.validate(['start_date']);
                self.render();
            }
        });
        endDateElem.addEventListener(tempusDominus.Namespace.events.change, (e) => {
            if (typeof e.detail.date !== 'undefined') {
                self.data.end_date = self.formatDate(e.detail.date);
            }
        });



        var pickerParams = {
            uploadInBackground: false,
            maxFiles: 20,
            fromSources: ["local_file_system"],
            onUploadDone: function (uploadedResults) {
                let resultJson = [];
                let docData = null;
                if (uploadedResults.filesUploaded.length > 0) {
                    $.each(uploadedResults.filesUploaded, function (indx, files) {
                        docData = self.processMedia(files);
                        resultJson.push(docData);
                    });
                    const resultJsonStr = JSON.stringify(resultJson);
                    const postdata = {
                        'blogs' : self.data.blogs,
                        'imgData' : resultJsonStr,
                        'multiple' : true
                    };

                    const imageTrayElem = document.getElementById('imageArray');
                    imageTrayElem.classList.add('spinner', 'carousel-tray--active');

                    Server.create('/api/article/save-image', postdata).done(function(r) {
                        console.log(r);
                        if (r.success === 1) {
                            if (self.saveImage(r, resultJson) ) {
                                imageTrayElem.classList.remove('spinner', 'carousel-tray--active');
                            }
                        }
                    }).fail(function(r) {
                        console.log(r);
                    });


                    // $('#ModalCoverImage').modal('hide');
                }

                if (uploadedResults.filesFailed.length > 0) {
                    console.log('Upload failed');
                    console.log(uploadedResults.filesFailed);
                }
            },
            onFileUploadFailed: function(uploadedResults) {
                hasUploadStarted = false;
                if (opts.onError && typeof opts.onError === 'function') {
                    opts.onError(uploadedResults);
            }
            },
            onUploadStarted: function() {
                console.log('upload started');
            }
        };





        const pickerElem = document.getElementById('file-picker');
        pickerElem.addEventListener('click', () => {
            const filestackClient = filestack.init(_appJsConfig.filepickerKey);

            var filestackInstance = filestackClient.picker(pickerParams);
            filestackInstance.open();
        });

        $('#imageArray').on('click', '.carousel-tray__delete', function(e) {
            var elem = $(e.target);
            var mediaId = elem.data('id');
            const modal = new Modal('modal', 'signin-modal', {
                "delete"   : 'listingDeleteTmpl',
            });
        
            modal.render("delete", "Warning", {
                 msg: "Are you sure you want to delete this image?", 
                 role:"okay"
            }).done(() => {
                self.deleteImage({elem: elem, id: mediaId});
                modal.closeWindow();
            });
        });



        // var EventPostGoogleMap = function () {
        //     var marker, geocoder;
        //     var elem = $('#addressMap');
        //     var latitude = elem.data('latitude');
        //     var longitude = elem.data('longitude');
        //     var map;
            
        //     //google.maps.event.addDomListener(window, 'load', initMap);
        //     function initMap() {
        //         var mapLat;
        //         var mapLong;
        //         if (latitude !== '' && longitude !== '') {
        //             mapLat = latitude;
        //             mapLong = longitude;

        //             geocoder = new google.maps.Geocoder();
        //             var params = {
        //                 zoom: 10,
        //                 center: {lat: mapLat, lng: mapLong}
        //             };
        //             map = new google.maps.Map(document.getElementById('addressMap'), params);

        //             //set current marker
        //             updateMarker = new google.maps.Marker({
        //                 position: new google.maps.LatLng(latitude, longitude),
        //                 map: map
        //             });
        //         } 
        //         else {
        //             //navigator.geolocation.getCurrentPosition(function (position) {});
        //             geocoder = new google.maps.Geocoder();
        //             map = new google.maps.Map(document.getElementById('addressMap'), {
        //                 zoom: 1,
        //                 center: {lat: 43.197167, lng: 56.425781}
        //             });
                    
        //         }
                
        //         pointLocation(geocoder, map, marker);
        //     }
            
        //     initMap();
        // };

        // var pointLocation = function (geocoder, map, marker) {
        //     $('#address1').on('change', function(e){
        //         mapLocation($(this));

        //     });
            
        //     function mapLocation(elem) {
        //         var address = elem.val();

        //         geocoder.geocode({address: address}, function (results, status) {
                    
        //             if (status === google.maps.GeocoderStatus.OK) {
        //                 map.setCenter(results[0].geometry.location);
        //                 map.setZoom(10);

        //                 //clear the previous marker
        //                 if (marker) {
        //                     marker.setMap(null);
        //                 }
        //                 marker = new google.maps.Marker({
        //                     map: map,
        //                     position: results[0].geometry.location
        //                 });
                        
        //                 // Set Lat and Long
        //                 var latitude = results[0].geometry.location.lat();
        //                 var longitude = results[0].geometry.location.lng();
        //                 var data = {
        //                     "location" : {
        //                         "latitude": latitude,
        //                         "longitude": longitude
        //                     }
        //                 };
        //                 Acme.PubSub.publish("update_state", data);
        //             } 
        //         });
        //     } 
        // };

        // EventPostGoogleMap();
    }
    EventForm.prototype.processMedia = function(Blob) {
        var type = '';
        if (typeof Blob.mimetype !== "undefined" && Blob.mimetype !== "") {
            var mimetypeArr = Blob.mimetype.split("/");
            type = mimetypeArr[0];
        }
        var docData = {
            "url": Blob.url, 
            "filename": Blob.filename, 
            "type": Blob.mimetype, 
            "size": Blob.size, 
            "mediaType": ((type === 'image' || type === 'video' || type === 'audio' || type === 'icon') ? type : 'doc'),
            "handle": Blob.handle,
            "key": Blob.key,
            "bucket": Blob.container
        };
        var parts = Blob.url.split("/");
        var filestackHandler = parts[parts.length - 1];
        if (typeof filestackHandler !== "undefined" && filestackHandler !== "") {
            docData.filestackHandle = filestackHandler;
        }
        return docData;
    };
    














export const GoogleMap = function() {

    this.marker;
    this.geocoder;
    this.mapContainer = $('#addressMap');
    this.latitude = this.mapContainer.data('latitude');
    this.longitude = this.mapContainer.data('longitude');
    this.map;
    this.init();
};
	GoogleMap.prototype.init = function()
	{
		var mapLat;
		var mapLong;
		if (this.latitude !== '' && this.longitude !== '') {
			mapLat = this.latitude;
			mapLong = this.longitude;

			this.geocoder = new google.maps.Geocoder();
			var params = {
				zoom: 14,
				center: {lat: mapLat, lng: mapLong}
			};
			this.map = new google.maps.Map(document.getElementById('addressMap'), params);

			//set current marker
			updateMarker = new google.maps.Marker({
				position: new google.maps.LatLng(this.latitude, this.longitude),
				map: this.map
			});
		} 
		else {
			//navigator.geolocation.getCurrentPosition(function (position) {});
			geocoder = new google.maps.Geocoder();
			this.map = new google.maps.Map(document.getElementById('addressMap'), {
				zoom: 1,
				center: {lat: 43.197167, lng: 56.425781}
			});   
		}
	};

















// Acme.Confirm = function(template, parent, layouts) {

//     this.template = template;
//     this.parentCont = parent;
//     this.layouts = layouts;
//     this.parent = Acme.modal.prototype;
//     this.data = {};
// };
//     Acme.Confirm.prototype = new Modal();
//     Acme.Confirm.constructor = Acme.Confirm;
//     Acme.Confirm.prototype.errorMsg = function(msg) {
//         $('.message').toggleClass('hide');
//     };
//     Acme.Confirm.prototype.handle = function(e) {
//         var self = this;
//         var $elem = this.parent.handle.call(this, e);
//         if ( $elem.is('a') ) {
//             if ($elem.hasClass('close')) {
//                 $('body').removeClass("active");
//                 this.closeWindow();
//             }
//         }
//         if ($elem.is('button')) {
//             if ($elem.hasClass('signin')) {
//                 e.preventDefault();
//                 var formData = {};
//                 $.each($('#loginForm').serializeArray(), function () {
//                     formData[this.name] = this.value;
//                 });
//                 Acme.server.create('/api/auth/login', formData).done(function(r) {
//                     // console.log(r);
//                     if (r.success === 1) {
//                         window.location.href = location.origin;
//                     } else {
//                         self.errorMsg();
//                     }
//                 }).fail(function(r) { console.log(r);});
//             }

//         }
//         if ($elem.hasClass('layout')) {
//             var layout = $elem.data('layout');
//             this.renderLayout(layout);
//         }

//         if ($elem.data('role') === 'deleteImage') {
//             PubSub.publish("update_state", {'delete image': self.data });
//         }

//     };

// var layouts = {
//     "listing"   : 'listingSavedTmpl',
//     "delete"   : 'listingDeleteTmpl',
// };




// const ConfirmView = function() {
//     this.data = {};
//     this.modal = new Modal('modal', 'signin-modal', {
//         "listing"   : 'listingSavedTmpl',
//         "delete"   : 'listingDeleteTmpl',
//     });
// };

//     ConfirmView.subscriptions = PubSub.subscribe({
//         'Acme.confirmView.listener' : ['update_state']
//     });

//     ConfirmView.listeners = 
//     {
//         "confirm" : function(data, topic) {
//             this.modal.render("listing", "Thank you for submitting your event.");
//         },
//         "confirmDelete" : function(data, topic) {
//             this.modal.render("delete", "Warning", { msg: "Are you sure you want to permanently delete this listing?", role:"delete"});
//         },
//         "confirmDeleteImage" : function(data, topic) {
//             console.log('in confirming delete image');
//             this.data = data;
//             this.modal.render("delete", "Warning", 
//                 {
//                      msg: "Are you sure you want to delete this image?", 
//                      role:"deleteImage"
//                  }
//             );
//         },
//         "closeConfirm" : function(data, topic) {
//             this.modal.closeWindow();
//         }
//     };


// Acme.confirmView = new ConfirmView();