var Map = function () {
    var _this = this;
    this.gally = [];
    this.map = new BMap.Map('map');
    this.info = new BMap.InfoWindow('',{offset:{width:5,height:-10}});
    this.info.addEventListener('open', function () {
        document.getElementById(this.imgId).onload = function () {
            _this.info.redraw()
        }
    })
    this.info.addEventListener('close', function (e) {
        _this.gally = []
    })
    this.init = function () {
        var point = new BMap.Point(116.404, 39.915);
        this.map.centerAndZoom(point, 6);
        this.map.enableScrollWheelZoom(true);

    }
    this.getId = function (img) {
        return img.replace(/\//g, '').replace(/\./g, '')
    }
    this.point = function (location) {
        location.x = location.x || location.lng;
        location.y = location.y || location.lat;
        return new BMap.Point(location.x, location.y);

    }
    this.convertor = function (location, callback) {
        var convertor = new BMap.Convertor();
        convertor.translate([location], 3, 5, function (data) {
            callback(data.points[0])
        })
    }
    this.marker = function (point) {
        var marker = new BMap.Marker(_this.point(point.position));
        _this.markerClick(point, marker);
        _this.map.addOverlay(marker);

    }
    this.content = function (point) {
        var content = '<p>' + point.title + '</p>';
        content += '<a class="fancybox" data-fancybox="gallery" href="javascript:fancybox()">'
        content += '<img class="cover" style="width:250px;min-height:60px" id="' + _this.getId(point.thumb) + '" src="' + point.prefix + 'thumb.jpg" /></a>'
        content += '</div>'
        return content
    }
    this.markerClick = function (point, marker) {
        marker.addEventListener('click', function (e) {
            var p = e.target;
            _this.info.setContent(_this.content(point));
            _this.info.imgId = _this.getId(point.thumb);
            _this.map.openInfoWindow(_this.info, _this.point(p.getPosition()));
            _this.gally = point.photos.map(function(item){
                item.photo = point.prefix + item.photo;
                return item;
            });
        })
    }
    this.markers = function (timeline) {
        if (timeline.length) {
            timeline.forEach(function (item) {
                item.prefix = 'albums/' + item.year + '/' + item.month + '/' + item.title + '/'
                _this.marker(item)
            })
        }
    }
    this.init();
}

window.funMap = new Map();
funMap.markers(window.note.timeline);

function fancybox() {
    $.fancybox.open(funMap.gally.map(function (item) {
        return { src: item.photo, opts: { caption: item.note } }
    }), { loop: true, type: 'image' })
}


