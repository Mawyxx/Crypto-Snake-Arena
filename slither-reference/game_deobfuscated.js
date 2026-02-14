var testing = false;
if (window.location.href.indexOf("/testing") >= 0) testing = true;
var iioc = false;
var nsr = false;
var graphicsQuality = document.getElementById("grq");
var graphicsQualityHolder = document.getElementById("grqh");
var phqi = document.createElement("img");
var useWebGL = false;
try {
  var ztc = document.createElement("canvas");
  var gle = ztc.getContext("webgl") || ztc.getContext("webgl2");
  if (gle && gle instanceof WebGLRenderingContext) useWebGL = true
} catch (e) {}
useWebGL = false;
if (!TouchEvent) var TouchEvent = function() {};
var lang = navigator.language || navigator.userLanguage;
lang = lang.substr(0, 2);
var forcing = false;
var forcedBestServerObj = null;

function forceServerOnce(ip, po, aa) {
  forcing = true;
  forcedBestServerObj = {};
  forcedBestServerObj.ip = ip;
  forcedBestServerObj.po = po;
  forcedBestServerObj.ac = 999;
  forcedBestServerObj.c_aa = aa
}
var ua = navigator.userAgent.toLowerCase();
var is_android = ua.indexOf("android") >= 0;
var is_amazon = ua.indexOf("kindle") >= 0 || ua.indexOf("silk/") >= 0;
var uua = navigator.userAgent;
var is_ios = uua.indexOf("iPad") >= 0 || uua.indexOf("iPhone") >= 0 || uua.indexOf("iPod") >= 0;
var is_mobile = ua.indexOf("mobile") >= 0;
var is_firefox = ua.indexOf("firefox") > -1;
var is_ie8oo = window.attachEvent && !window.addEventListener;
var is_chrome = false;
var is_osx = false;
var osx_ver = -1;
var is_safari = false;
if (ua.indexOf("safari") >= 0)
  if (ua.indexOf("chrome") == -1) is_safari = true;
if (ua.indexOf("chrome") >= 0)
  if (!is_safari)
    if (!is_firefox) is_chrome = true;
if (ua.indexOf("mac os x ") >= 0) {
  var j = ua.indexOf("mac os x ");
  if (j >= 0) {
    j += 9;
    var vs = [];
    var v = 0;
    for (var i = j; i < ua.length; i++) {
      var k = ua.charCodeAt(i);
      if (k >= 48 && k <= 57) {
        v *= 10;
        v += k - 48
      } else {
        vs.push(v);
        v = 0;
        if (vs.length == 3 || k != 46 && k != 95) break
      }
    }
    if (vs.length >= 2)
      if (vs[0] == 10) {
        is_osx = true;
        osx_ver = vs[1]
      }
  }
}
if (navigator.platform) {
  var ptf = ("" + navigator.platform).toLowerCase();
  if (ptf.substr(0, 3) != "mac") is_osx = false
}
var noRequestAnimationFrame = false;
var requestAnimationFrame = function(x) {};
if (window.requestAnimationFrame) requestAnimationFrame = window.requestAnimationFrame;
else if (window.mozRequestAnimationFrame) requestAnimationFrame = window.mozRequestAnimationFrame;
else if (window.webkitRequestAnimationFrame) requestAnimationFrame = window.webkitRequestAnimationFrame;
else noRequestAnimationFrame = true;
var timeObject = Date;
try {
  if (performance) {
    var v = performance.now();
    timeObject = performance;
    if (testing) console.log("timeObj set to performance")
  }
} catch (e) {}
var lfsx;
var lfsy;
var lfcv;
var lfvsx;
var lfvsy;
var lfesid;
var segmentsDrawn = 0;
var foodsDrawn = 0;
var vvd = [];
var vch = 0;
var doiosh = false;
if (is_chrome)
  if (is_osx)
    if (osx_ver != -1)
      if (osx_ver <= 11) nsr = true;
var a, i, j, k, l, m, n, o, r, v;
var j2;
var fj;
var fjm4;
var d, d2, d3;
var qq;
var ki;
var sc;
var gpuTransform = "translateZ(0)";
var ang, sang, vang;

function setTransform(d, s) {
  d.style.webkitTransform = d.style.OTransform = d.style.msTransform = d.style.MozTransform = d.style.transform = s
}

function setTransformOrigin(d, s) {
  d.style.webkitTransformOrigin = d.style.OTransformOrigin = d.style.msTransformOrigin = d.style.MozTransformOrigin = d
    .style.transformOrigin = s
}
var TWO_PI = 2 * Math.PI;
var RAD_TO_FIXED_POINT = 65536 / TWO_PI;
var FIXED_POINT_TO_RAD = TWO_PI / 65536;
var piar = [4, 21, 0, 11];
var isAnimating = false;
var startAnimation = function() {
  isAnimating = true;
  if (!noRequestAnimationFrame) requestAnimationFrame(gameLoop);
  else if (is_mobile) setInterval("oef()", 33);
  else if (is_safari) setInterval("oef()", 33);
  else setInterval("oef()", 20)
};
var loadingImages = [];
var waitingImageCount = 0;
var loadImage = function(n) {
  waitingImageCount++;
  var o = {};
  var ii = document.createElement("img");
  o.ii = ii;
  o.scale = 1;
  ii.onload = function() {
    for (var i = loadingImages.length - 1; i >= 0; i--)
      if (loadingImages[i].ii == this) {
        var o = loadingImages[i];
        o.ww = this.width;
        o.hh = this.height;
        o.loaded = true;
        if (o.onload) o.onload();
        break
      } waitingImageCount--;
    if (waitingImageCount == 0) startAnimation()
  };
  o.src = n;
  loadingImages.push(o);
  return o
};

function addCssStyles(cssCode) {
  var styleElement = document.createElement("style");
  document.getElementsByTagName("head")[0].appendChild(styleElement);
  styleElement.type = "text/css";
  if (styleElement.styleSheet) styleElement.styleSheet.cssText = cssCode;
  else styleElement.appendChild(document.createTextNode(cssCode))
}
var textShadowStyles = [];
for (var tx = -1; tx <= 1; tx++)
  for (var ty = -1; ty <= 1; ty++) textShadowStyles.push(tx + "px " + ty + "px 0 #000");
textShadowStyles = textShadowStyles.join(", ");

function RectanglePacker(width, height, padding) {
  this.mWidth = 0;
  this.mHeight = 0;
  this.mPadding = 8;
  this.mPackedWidth = 0;
  this.mPackedHeight = 0;
  this.mInsertList = [];
  this.mInsertedRectangles = [];
  this.mFreeAreas = [];
  this.mNewFreeAreas = [];
  this.mOutsideRectangle = new IntegerRectangle(width + 1, height + 1, 0, 0);
  this.mSortableSizeStack = [];
  this.mRectangleStack = [];
  this.rectangleCount = function() {
    return this.mInsertedRectangles.length
  };
  this.reset = function(width, height, padding) {
    while (this.mInsertedRectangles.length > 0) this.freeRectangle(this.mInsertedRectangles.pop());
    while (this.mFreeAreas.length > 0) this.freeRectangle(this.mFreeAreas.pop());
    this.mWidth = width;
    this.mHeight = height;
    this.mPackedWidth = 0;
    this.mPackedHeight = 0;
    this.mFreeAreas[0] = this.allocateRectangle(0, 0, this.mWidth, this.mHeight);
    while (this.mInsertList.length > 0) this.freeSize(this.mInsertList.pop());
    this.mPadding = padding
  };
  this.getRectangle = function(index, rectangle) {
    var inserted = this.mInsertedRectangles[index];
    if (rectangle) {
      rectangle.x = inserted.x;
      rectangle.y = inserted.y;
      rectangle.width = inserted.width;
      rectangle.height =
        inserted.height;
      return rectangle
    }
    return new IntegerRectangle(inserted.x, inserted.y, inserted.width, inserted.height)
  };
  this.getRectangleId = function(index) {
    var inserted = this.mInsertedRectangles[index];
    return inserted.id
  };
  this.insertRectangle = function(width, height, id) {
    var sortableSize = this.allocateSize(width, height, id);
    this.mInsertList.push(sortableSize)
  };
  this.packRectangles = function(sort) {
    if (sort) this.mInsertList.sort(numsort_width);
    while (this.mInsertList.length > 0) {
      var sortableSize = this.mInsertList.pop();
      var width = sortableSize.width;
      var height = sortableSize.height;
      var index = this.getFreeAreaIndex(width, height);
      if (index >= 0) {
        var freeArea = this.mFreeAreas[index];
        var target = this.allocateRectangle(freeArea.x, freeArea.y, width, height);
        target.id = sortableSize.id;
        this.generateNewFreeAreas(target, this.mFreeAreas, this.mNewFreeAreas);
        while (this.mNewFreeAreas.length > 0) this.mFreeAreas[this.mFreeAreas.length] = this.mNewFreeAreas.pop();
        this.mInsertedRectangles[this.mInsertedRectangles.length] = target;
        if (target.right > this.mPackedWidth) this.mPackedWidth =
          target.right;
        if (target.bottom > this.mPackedHeight) this.mPackedHeight = target.bottom
      }
      this.freeSize(sortableSize)
    }
    return this.rectangleCount()
  };
  this.filterSelfSubAreas = function(areas) {
    for (var i = areas.length - 1; i >= 0; i--) {
      var filtered = areas[i];
      for (var j = areas.length - 1; j >= 0; j--)
        if (i != j) {
          var area = areas[j];
          if (filtered.x >= area.x && filtered.y >= area.y && filtered.right <= area.right && filtered.bottom <= area
            .bottom) {
            this.freeRectangle(filtered);
            var topOfStack = areas.pop();
            if (i < areas.length) areas[i] = topOfStack;
            break
          }
        }
    }
  };
  this.generateNewFreeAreas = function(target, areas, results) {
    var x = target.x;
    var y = target.y;
    var right = target.right + 1 + this.mPadding;
    var bottom = target.bottom + 1 + this.mPadding;
    var targetWithPadding = null;
    if (this.mPadding == 0) targetWithPadding = target;
    for (var i = areas.length - 1; i >= 0; i--) {
      var area = areas[i];
      if (!(x >= area.right || right <= area.x || y >= area.bottom || bottom <= area.y)) {
        if (!targetWithPadding) targetWithPadding = this.allocateRectangle(target.x, target.y, target.width + this
          .mPadding, target.height + this.mPadding);
        this.generateDividedAreas(targetWithPadding,
          area, results);
        var topOfStack = areas.pop();
        if (i < areas.length) areas[i] = topOfStack
      }
    }
    if (targetWithPadding && targetWithPadding != target) this.freeRectangle(targetWithPadding);
    this.filterSelfSubAreas(results)
  };
  this.generateDividedAreas = function(divider, area, results) {
    var count = 0;
    var rightDelta = area.right - divider.right;
    if (rightDelta > 0) {
      results[results.length] = this.allocateRectangle(divider.right, area.y, rightDelta, area.height);
      count++
    }
    var leftDelta = divider.x - area.x;
    if (leftDelta > 0) {
      results[results.length] = this.allocateRectangle(area.x,
        area.y, leftDelta, area.height);
      count++
    }
    var bottomDelta = area.bottom - divider.bottom;
    if (bottomDelta > 0) {
      results[results.length] = this.allocateRectangle(area.x, divider.bottom, area.width, bottomDelta);
      count++
    }
    var topDelta = divider.y - area.y;
    if (topDelta > 0) {
      results[results.length] = this.allocateRectangle(area.x, area.y, area.width, topDelta);
      count++
    }
    if (count == 0 && (divider.width < area.width || divider.height < area.height)) results[results.length] = area;
    else this.freeRectangle(area)
  };
  this.getFreeAreaIndex = function(width, height) {
    var best =
      this.mOutsideRectangle;
    var index = -1;
    var paddedWidth = width + this.mPadding;
    var paddedHeight = height + this.mPadding;
    var count = this.mFreeAreas.length;
    for (var i = count - 1; i >= 0; i--) {
      var free = this.mFreeAreas[i];
      if (free.x < this.mPackedWidth || free.y < this.mPackedHeight) {
        if (free.x < best.x && paddedWidth <= free.width && paddedHeight <= free.height) {
          index = i;
          if (paddedWidth == free.width && free.width <= free.height && free.right < this.mWidth || paddedHeight ==
            free.height && free.height <= free.width) break;
          best = free
        }
      } else if (free.x < best.x &&
        width <= free.width && height <= free.height) {
        index = i;
        if (width == free.width && free.width <= free.height && free.right < this.mWidth || height == free.height &&
          free.height <= free.width) break;
        best = free
      }
    }
    return index
  };
  this.allocateRectangle = function(x, y, width, height) {
    if (this.mRectangleStack.length > 0) {
      var rectangle = this.mRectangleStack.pop();
      rectangle.x = x;
      rectangle.y = y;
      rectangle.width = width;
      rectangle.height = height;
      rectangle.right = x + width;
      rectangle.bottom = y + height;
      return rectangle
    }
    return new IntegerRectangle(x, y, width, height)
  };
  this.freeRectangle = function(rectangle) {
    this.mRectangleStack[this.mRectangleStack.length] = rectangle
  };
  this.allocateSize = function(width, height, id) {
    if (this.mSortableSizeStack.length > 0) {
      var size = this.mSortableSizeStack.pop();
      size.width = width;
      size.height = height;
      size.id = id;
      return size
    }
    return new SortableSize(width, height, id)
  };
  this.freeSize = function(size) {
    this.mSortableSizeStack[this.mSortableSizeStack.length] = size
  };
  this.reset(width, height, padding)
}

function IntegerRectangle(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.right = x + width;
  this.bottom = y + height
}

function SortableSize(width, height, id) {
  this.width = width;
  this.height = height;
  this.id = id
}
var numsort_width = function(a, b) {
  return a.width - b.width
};
var texture_sheets = [];
var textures = [];
var tssz = 2048;
var cc = document.createElement("canvas");
cc.width = cc.height = tssz;
var o = {};
o.width = tssz;
o.height = tssz;
o.cc = cc;
texture_sheets.push(o);
var sadg, sadu, sadd;
var j, k, l, p;
var xx, yy;
var rad;
var grw, grh;
var elem, map, imgd;
var ctx;
var l;
var p;
var rw, rh;
elem = document.createElement("canvas");
grw = 2;
grh = 56;
elem.width = grw;
elem.height = grh;
ctx = elem.getContext("2d");
map = ctx.getImageData(0, 0, grw, grh);
imgd = map.data;
l = imgd.length;
p = 0;
for (yy = 0; yy < grh; yy++) {
  j = (grh - 1 - yy) / (grh - 1);
  j = .5 * (1 - Math.cos(Math.PI * j));
  for (xx = 0; xx < grw; xx++) {
    imgd[p] = Math.min(255, Math.floor(.85 * 64 + .5 * 64 * j));
    imgd[p + 1] = Math.min(255, Math.floor(.85 * 128 + .5 * 128 * j));
    imgd[p + 2] = Math.min(255, Math.floor(.85 * 96 + .5 * 96 * j));
    imgd[p + 3] = 255;
    p += 4
  }
}
ctx.putImageData(map, 0, 0);
sadg = elem.toDataURL();
elem = document.createElement("canvas");
elem.width = grw;
elem.height = grh;
ctx = elem.getContext("2d");
map = ctx.getImageData(0, 0, grw, grh);
imgd = map.data;
l = imgd.length;
p = 0;
for (yy = 0; yy < grh; yy++) {
  j = (grh - 1 - yy) / (grh - 1);
  j = .5 * (1 - Math.cos(Math.PI * j));
  for (xx = 0; xx < grw; xx++) {
    imgd[p] = Math.min(255, Math.floor(1.5 * 48 + .95 * 48 * j));
    imgd[p + 1] = Math.min(255, Math.floor(1.5 * 114 + .95 * 98 * j));
    imgd[p + 2] = Math.min(255, Math.floor(1.5 * 88 + .95 * 87 * j));
    imgd[p + 3] = 255;
    p += 4
  }
}
ctx.putImageData(map, 0, 0);
sadu = elem.toDataURL();
elem = document.createElement("canvas");
elem.width = grw;
elem.height = grh;
ctx = elem.getContext("2d");
map = ctx.getImageData(0, 0, grw, grh);
imgd = map.data;
l = imgd.length;
p = 0;
for (yy = 0; yy < grh; yy++) {
  j = yy / (grh - 1);
  j = .5 * (1 - Math.cos(Math.PI * j));
  for (xx = 0; xx < grw; xx++) {
    imgd[p] = Math.floor(.1 * 48 + .75 * 48 * j);
    imgd[p + 1] = Math.floor(.1 * 70 + .75 * 70 * j);
    imgd[p + 2] = Math.floor(.1 * 64 + .75 * 64 * j);
    imgd[p + 3] = 255;
    p += 4
  }
}
ctx.putImageData(map, 0, 0);
sadd = elem.toDataURL();
if (sadg.length > 32 && sadu.length > 32 && sadd.length > 32) addCssStyles(".sadg1 { background-image:url(" + sadg +
  "); }  .sadu1 { background-image:url(" + sadu + "); }  .sadd1 { background-image:url(" + sadd + "); }");
elem.width = grw;
elem.height = grh;
ctx = elem.getContext("2d");
map = ctx.getImageData(0, 0, grw, grh);
imgd = map.data;
l = imgd.length;
p = 0;
for (yy = 0; yy < grh; yy++) {
  j = (grh - 1 - yy) / (grh - 1);
  j = .5 * (1 - Math.cos(Math.PI * j));
  for (xx = 0; xx < grw; xx++) {
    imgd[p] = Math.min(255, Math.floor(.85 * 52 + .5 * 52 * j));
    imgd[p + 1] = Math.min(255, Math.floor(.85 * 96 + .5 * 96 * j));
    imgd[p + 2] = Math.min(255, Math.floor(.85 * 144 + .5 * 144 * j));
    imgd[p + 3] = 255;
    p += 4
  }
}
ctx.putImageData(map, 0, 0);
sadg = elem.toDataURL();
elem = document.createElement("canvas");
elem.width = grw;
elem.height = grh;
ctx = elem.getContext("2d");
map = ctx.getImageData(0, 0, grw, grh);
imgd = map.data;
l = imgd.length;
p = 0;
for (yy = 0; yy < grh; yy++) {
  j = (grh - 1 - yy) / (grh - 1);
  j = .5 * (1 - Math.cos(Math.PI * j));
  for (xx = 0; xx < grw; xx++) {
    imgd[p] = Math.min(255, Math.floor(1.5 * 48 + .95 * 48 * j));
    imgd[p + 1] = Math.min(255, Math.floor(1.5 * 88 + .95 * 87 * j));
    imgd[p + 2] = Math.min(255, Math.floor(1.5 * 114 + .95 * 98 * j));
    imgd[p + 3] = 255;
    p += 4
  }
}
ctx.putImageData(map, 0, 0);
sadu = elem.toDataURL();
elem = document.createElement("canvas");
elem.width = grw;
elem.height = grh;
ctx = elem.getContext("2d");
map = ctx.getImageData(0, 0, grw, grh);
imgd = map.data;
l = imgd.length;
p = 0;
for (yy = 0; yy < grh; yy++) {
  j = yy / (grh - 1);
  j = .5 * (1 - Math.cos(Math.PI * j));
  for (xx = 0; xx < grw; xx++) {
    imgd[p] = Math.floor(.1 * 48 + .75 * 48 * j);
    imgd[p + 1] = Math.floor(.1 * 54 + .75 * 54 * j);
    imgd[p + 2] = Math.floor(.1 * 70 + .75 * 70 * j);
    imgd[p + 3] = 255;
    p += 4
  }
}
ctx.putImageData(map, 0, 0);
sadd = elem.toDataURL();
if (sadg.length > 32 && sadu.length > 32 && sadd.length > 32) addCssStyles(".sadg2 { background-image:url(" + sadg +
  "); }  .sadu2 { background-image:url(" + sadu + "); }  .sadd2 { background-image:url(" + sadd + "); }");
var mouseOverStates = [];
var wantHoverMouseOverState = false;
var setWindowMouseUp = false;

function makeButton(elemid, prefix, iw, ih) {
  var ho = document.createElement("div");
  var elem;
  if (elemid.tagName) elem = elemid;
  else {
    elem = document.getElementById(elemid);
    elem.style.width = iw + "px";
    elem.style.height = ih + "px";
    ho.style.width = iw + "px";
    ho.style.height = ih + "px"
  }
  var o = {};
  o.lic = 0;
  o.elem = elem;
  o.mouseDown = false;
  o.mo = false;
  o.mouseDownf = 0;
  o.mof = 0;
  var str = true;
  if (elem.style)
    if (elem.style.position) {
      if ((elem.style.position + "").toLowerCase() == "absolute") str = false;
      if ((elem.style.position + "").toLowerCase() == "fixed") str = false
    } if (str) elem.style.position =
    "relative";
  ho.style.position = "absolute";
  ho.style.opacity = 0;
  ho.style.left = "0px";
  ho.style.top = "0px";
  elem.appendChild(ho);
  o.ho = ho;
  o.alic = function() {
    this.lic++;
    if (this.lic == 3) {
      this.ho.style.opacity = 1;
      if (this.onload) this.onload()
    }
  };
  mouseOverStates.push(o);
  o.setEnabled = function(e) {
    if (e) {
      this.disabled = false;
      this.upi.style.opacity = this.mof;
      this.downi.style.opacity = this.mdf;
      this.elem.style.opacity = 1;
      this.elem.style.cursor = "pointer"
    } else {
      this.disabled = true;
      this.upi.style.opacity = 0;
      this.downi.style.opacity = 0;
      this.elem.style.opacity =
        .38;
      this.elem.style.cursor = "default"
    }
  };
  if (!prefix) ho.style.opacity = 1;
  else
    for (var k = 1; k <= 3; k++) {
      var ii = document.createElement("img");
      ii.draggable = false;
      ii.style.position = "absolute";
      ii.style.left = "0px";
      ii.style.top = "0px";
      ii.border = 0;
      ii.width = iw;
      ii.height = ih;
      ii.className = "nsi";
      ho.appendChild(ii);
      if (k == 1) {
        o.normi = ii;
        ii.onload = function() {
          for (var i = mouseOverStates.length - 1; i >= 0; i--) {
            var o = mouseOverStates[i];
            if (o.normi == this) {
              o.alic();
              break
            }
          }
        };
        ii.src = prefix + ".png"
      } else if (k == 2) {
        o.upi = ii;
        ii.style.opacity = 0;
        ii.onload = function() {
          for (var i =
              mouseOverStates.length - 1; i >= 0; i--) {
            var o = mouseOverStates[i];
            if (o.upi == this) {
              o.alic();
              break
            }
          }
        };
        ii.src = prefix + "up.png"
      } else if (k == 3) {
        o.downi = ii;
        ii.style.opacity = 0;
        ii.onload = function() {
          for (var i = mouseOverStates.length - 1; i >= 0; i--) {
            var o = mouseOverStates[i];
            if (o.downi == this) {
              o.alic();
              break
            }
          }
        };
        ii.src = prefix + "down.png"
      }
    }
  elem.onmouseenter = function() {
    for (var k = mouseOverStates.length - 1; k >= 0; k--) {
      var o = mouseOverStates[k];
      if (o.elem == this) {
        if (!o.disabled)
          if (!o.mo) {
            o.mo = true;
            if (o.onmouseenter) o.onmouseenter();
            wantHoverMouseOverState = true
          } break
      }
    }
  };
  elem.onmouseleave = function() {
    for (var k = mouseOverStates.length - 1; k >=
      0; k--) {
      var o = mouseOverStates[k];
      if (o.elem == this) {
        if (o.mo) {
          o.mo = false;
          if (o.onmouseleave) o.onmouseleave();
          wantHoverMouseOverState = true
        }
        break
      }
    }
  };
  elem.onmousedown = function(e) {
    for (var k = mouseOverStates.length - 1; k >= 0; k--) {
      var o = mouseOverStates[k];
      if (o.elem == this) {
        if (!o.disabled)
          if (!o.mouseDown) {
            o.mouseDown = true;
            if (o.onmousedown) o.onmousedown(e, o);
            wantHoverMouseOverState = true;
            return false
          } break
      }
    }
  };
  elem.onmouseup = elem.ondragend = function(e) {
    for (var k = mouseOverStates.length - 1; k >= 0; k--) {
      var o = mouseOverStates[k];
      if (o.elem == this) {
        if (o.mouseDown) {
          o.mouseDownf = 1;
          o.mouseDown = false;
          if (o.onmouseup) {
            o.onmouseup(e, o);
            if (is_mobile) o.elem.onmouseleave()
          }
          wantHoverMouseOverState =
            true
        }
        break
      }
    }
  };
  if (!setWindowMouseUp) {
    setWindowMouseUp = true;
    window.onmouseup = window.ondragover = window.ondragend = function() {
      for (var i = mouseOverStates.length - 1; i >= 0; i--) {
        var o = mouseOverStates[i];
        if (o.mouseDown) {
          o.mouseDown = false;
          wantHoverMouseOverState = true
        }
      }
    }
  }
  return o
}

function handleMouseOverState() {
  var wa;
  var dstf = false;
  for (var i = mouseOverStates.length - 1; i >= 0; i--) {
    var o = mouseOverStates[i];
    wa = false;
    if (o.mo) {
      if (o.mof != 1) {
        dstf = true;
        o.mof += .33;
        if (o.mof >= 1) o.mof = 1;
        wa = true
      }
    } else if (o.mof != 0) {
      dstf = true;
      o.mof -= .2;
      if (o.mof <= 0) o.mof = 0;
      wa = true
    }
    if (wa)
      if (o.disabled) o.upi.style.opacity = 0;
      else o.upi.style.opacity = o.mof;
    wa = false;
    if (o.mouseDown) {
      if (o.mouseDownf != 1) {
        dstf = true;
        o.mouseDownf += .33;
        if (o.mouseDownf >= 1) o.mouseDownf = 1;
        wa = true
      }
    } else if (o.mouseDownf != 0) {
      dstf = true;
      o.mouseDownf -= .2;
      if (o.mouseDownf <= 0) o.mouseDownf = 0;
      wa = true
    }
    if (wa)
      if (o.disabled) o.downi.style.opacity = 0;
      else o.downi.style.opacity =
        o.mouseDownf
  }
  if (!dstf) wantHoverMouseOverState = false
}

function makeTextButton(s, bh, ts, br, bgm) {
  if (!bh) bh = 56;
  if (bh > 56) bh = 56;
  if (!ts) ts = 15;
  if (!br) br = 14;
  var btndiv = document.createElement("div");
  btndiv.className = "btnt nsi sadg" + bgm;
  var st = btndiv.style;
  st.position = "absolute";
  st.width = "auto";
  st.color = "#ffffff";
  st.fontWeight = "bold";
  st.textAlign = "center";
  st.fontFamily = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
  st.fontSize = ts + "px";
  btndiv.textContent = s;
  st.cursor = "pointer";
  document.body.appendChild(btndiv);
  var btnw = Math.ceil(35 + btndiv.offsetWidth);
  document.body.removeChild(btndiv);
  btndiv.textContent = "";
  st.width = btnw + "px";
  st.height = bh + "px";
  st.lineHeight = bh + "px";
  if (!is_mobile) st.boxShadow = "0px 3px 20px rgba(0,0,0, .75)";
  st.borderRadius = br + "px";
  var btnu = document.createElement("div");
  var st = btnu.style;
  st.position = "absolute";
  st.left = st.top = "0px";
  st.width = btnw + "px";
  st.height = bh + "px";
  st.borderRadius = br + 1 + "px";
  st.opacity = 0;
  btnu.className = "sadu" + bgm;
  var btnd = document.createElement("div");
  var st = btnd.style;
  st.position = "absolute";
  st.left = st.top = "-1px";
  st.width = btnw + 2 + "px";
  st.height = bh +
    2 + "px";
  st.borderRadius = br + "px";
  st.opacity = 0;
  btnd.className = "sadd" + bgm;
  var o = makeButton(btndiv);
  o.a = 1;
  o.ho.appendChild(btnu);
  o.upi = btnu;
  o.ho.appendChild(btnd);
  o.downi = btnd;
  o.ts = ts;
  o.ww = btnw;
  o.bgm = bgm;
  o.setText = function(t) {
    var testdiv = document.createElement("div");
    testdiv.className = "nsi sadg" + this.bgm;
    var st = testdiv.style;
    st.position = "absolute";
    st.width = "auto";
    st.color = "#ffffff";
    st.fontWeight = "bold";
    st.textAlign = "center";
    st.fontFamily = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
    st.fontSize = this.ts +
      "px";
    testdiv.textContent = t;
    document.body.appendChild(testdiv);
    var btnw = Math.ceil(35 + testdiv.offsetWidth);
    document.body.removeChild(testdiv);
    this.btnf.textContent = t;
    this.ww = btnw;
    this.elem.style.width = btnw + "px";
    this.upi.style.width = btnw + "px";
    this.downi.style.width = btnw + 2 + "px";
    this.btnf.style.width = btnw + "px"
  };
  var btnf = document.createElement("div");
  btndiv.appendChild(btnf);
  o.btnf = btnf;
  var st = btnf.style;
  st.position = "absolute";
  st.left = st.top = "0px";
  st.width = btnw + "px";
  st.height = bh + "px";
  st.borderRadius = br +
    "px";
  btnf.textContent = s;
  btnf.className = "nsi";
  st.color = "#ffffff";
  st.opacity = .9;
  o.ho.appendChild(btnf);
  return o
}

function heyStupidCheck() {
  var os = document.getElementsByTagName("script");
  for (var i = os.length - 1; i >= 0; i--) {
    var o = os[i];
    try {
      if (o.src)
        if ((o.src + "").indexOf("mindscape.xyz") >= 0) {
          var div = document.createElement("div");
          div.style.width = "100%";
          div.style.height = "100%";
          div.style.position = "fixed";
          div.style.left = div.style.top = "0px";
          div.style.zIndex = 2147483647;
          div.style.fontSize = "87px";
          div.style.color = "#FF3030";
          div.style.background = "#FFFFFF";
          if ((o.src + "").indexOf("android") >= 0) div.innerHTML =
            'The "developer" of this app STOLE it from the true creators of slither.io. <a href="https://play.google.com/store/apps/details?id=air.com.hypah.io.slither">Tap here to download the real game!</a>';
          else div.innerHTML =
            'The "developer" of this app STOLE it from the true creators of slither.io. <a href="https://itunes.apple.com/us/app/slither.io/id1091944550?ls=1&mt=8">Tap here to download the real game!</a>';
          document.body.appendChild(div)
        }
    } catch (ee) {}
  }
  if (is_ios)
    if (mba && !mba.parentNode) {
      var div = document.createElement("div");
      div.style.width = "100%";
      div.style.height = "100%";
      div.style.position = "fixed";
      div.style.left = div.style.top = "0px";
      div.style.zIndex = 2147483647;
      div.style.fontSize = "87px";
      div.style.color =
        "#FF3030";
      div.style.background = "#FFFFFF";
      div.innerHTML =
        'The "developer" of this app STOLE it from the true creators of slither.io. <a href="https://itunes.apple.com/us/app/slither.io/id1091944550?ls=1&mt=8">Tap here to download the real game!</a>';
      document.body.appendChild(div)
    }
}
setInterval(heyStupidCheck, 8E3);
var serverList = [];
var clusters = [];
var bestServer;
var bestCluster = null;
var bestClusterPingTime = 9999999;
var forcedBestServer = null;
var real_sid;

function recalcTaintedServers() {
  var currentTime = timeObject.now();
  for (i = 0; i < serverList.length; i++) {
    var o = serverList[i];
    if (o.tainted)
      if (currentTime - o.tainted_mtm > 12E4) o.tainted = false
  }
}

function recalcPingTimes() {
  recalcTaintedServers();
  var i, j, k;
  for (i = 0; i < serverList.length; i++) {
    serverList[i].ptm = 9999999;
    if (serverList[i].active) serverList[i].ptm--
  }
  bestCluster = null;
  bestClusterPingTime = 9999999;
  for (k = clusters.length - 1; k >= 0; k--) {
    var cluo = clusters[k];
    if (cluo)
      if (cluo.ptms.length > 0) {
        var optm = 0;
        for (j = cluo.ptms.length - 1; j >= 0; j--) optm += cluo.ptms[j];
        optm = optm / cluo.ptms.length;
        var ptm = 9999999;
        for (j = cluo.ptms.length - 1; j >= 0; j--)
          if (cluo.ptms[j] < ptm) ptm = cluo.ptms[j];
        if (testing) console.log("cluster " + k + "   ping time: " + ptm + "   old ping time: " + optm);
        if (ptm < bestClusterPingTime) {
          bestClusterPingTime =
            ptm;
          bestCluster = cluo
        }
        for (var j = serverList.length - 1; j >= 0; j--)
          if (serverList[j].clu == k) serverList[j].ptm = ptm
      }
  }
  var m;
  var v;
  var o;
  var cluo = bestCluster;
  if (cluo)
    for (j = 0; j < 50; j++) {
      if (cluo.serverList.length > 0) {
        m = 0;
        for (k = 0; k < cluo.serverList.length; k++) {
          o = cluo.serverList[k];
          if (o.active) {
            m += o.wg / cluo.swg;
            o.ptv = m
          }
        }
        if (o.active) o.ptv = 1;
        v = Math.random();
        forcedBestServer = null;
        for (k = 0; k < cluo.serverList.length; k++) {
          o = cluo.serverList[k];
          if (o.active)
            if (!o.tainted) {
              forcedBestServer = o;
              break
            }
        }
        for (k = 0; k < cluo.serverList.length; k++) {
          o = cluo.serverList[k];
          if (o.active)
            if (!o.tainted) {
              forcedBestServer = o;
              if (o.ptv >= v) break
            }
        }
        if (forcedBestServer)
          if (forcedBestServer.tainted) forcedBestServer =
            null
      }
      if (forcedBestServer != null) break
    }
}
var u_m = [64, 32, 16, 8, 4, 2, 1];
var accessories = ["oakley", "graduation", "funkystar", "headphones", "eyebrows", "spikecollar", "disguise", "cape",
  "crown", "antlers", "unicorn", "angel", "bat", "dragon", "bear", "rabbit", "cat", "dreadlocks", "blonde", "ginger",
  "blackhair", "mohawk", "catglass", "swirly", "nerdglass", "3dglass", "heartglass", "monocle", "deerstalker",
  "visor", "cap", "hardhat"
];
var a_imgs = [];
var a_ct;
for (var i = 0; i < accessories.length; i++) {
  var o = {};
  a_imgs.push(o);
  o.loaded = false;
  o.img = null;
  o.u = "http://slither.io/s/a_" + accessories[i] + ".png";
  if (i == 0) {
    o.scale = .205;
    o.px = 66;
    o.py = 174 / 2
  } else if (i == 1) {
    o.scale = .2;
    o.px = 205;
    o.py = 202 / 2
  } else if (i == 2) {
    o.scale = .205;
    o.px = 83;
    o.py = 174 / 2
  } else if (i == 3) {
    o.scale = .25;
    o.px = 130;
    o.py = 194 / 2
  } else if (i == 4) {
    o.scale = .25;
    o.px = 64;
    o.py = 164 / 2
  } else if (i == 5) {
    o.scale = .25;
    o.px = 94;
    o.py = 158 / 2
  } else if (i == 6) {
    o.scale = .25;
    o.px = 64;
    o.py = 180 / 2
  } else if (i == 7) {
    o.scale = .32;
    o.px = 170;
    o.py = 172 / 2
  } else if (i == 8) {
    o.scale = .18;
    o.px =
      180;
    o.py = 150 / 2
  } else if (i == 9) {
    o.scale = .3;
    o.px = 120;
    o.py = 200 / 2
  } else if (i == 10) {
    o.scale = .3;
    o.px = 201;
    o.py = 80 / 2
  } else if (i == 11) {
    o.scale = .3;
    o.px = 152;
    o.py = 250 / 2
  } else if (i == 12) {
    o.scale = .25;
    o.px = 132;
    o.py = 300 / 2
  } else if (i == 13) {
    o.scale = .25;
    o.px = 145;
    o.py = 280 / 2
  } else if (i == 14) {
    o.scale = .165;
    o.px = 115;
    o.py = 180 / 2
  } else if (i == 15) {
    o.scale = .19;
    o.px = 172;
    o.py = 250 / 2
  } else if (i == 16) {
    o.scale = .19;
    o.px = 127;
    o.py = 180 / 2
  } else if (i == 17) {
    o.scale = .25;
    o.px = 114;
    o.py = 160 / 2
  } else if (i == 18) {
    o.scale = .225;
    o.px = 144;
    o.py = 170 / 2
  } else if (i == 19) {
    o.scale = .225;
    o.px = 154;
    o.py = 178 / 2
  } else if (i ==
    20) {
    o.scale = .215;
    o.px = 159;
    o.py = 182 / 2
  } else if (i == 21) {
    o.scale = .215;
    o.px = 184;
    o.py = 94 / 2
  } else if (i == 22) {
    o.scale = .19;
    o.px = 88;
    o.py = 212 / 2
  } else if (i == 23) {
    o.scale = .19;
    o.px = 63;
    o.py = 212 / 2
  } else if (i == 24) {
    o.scale = .19;
    o.px = 93;
    o.py = 210 / 2
  } else if (i == 25) {
    o.scale = .17;
    o.px = 94;
    o.py = 244 / 2
  } else if (i == 26) {
    o.scale = .153;
    o.px = 54;
    o.py = 226 / 2
  } else if (i == 27) {
    o.scale = .175;
    o.px = 60;
    o.py = Math.floor(133 / 2 - 44)
  } else if (i == 28) {
    o.scale = .19;
    o.px = 195;
    o.py = 154 / 2
  } else if (i == 29) {
    o.scale = .21;
    o.px = 77;
    o.py = 184 / 2
  } else if (i == 30) {
    o.scale = .19;
    o.px = 194;
    o.py = 160 / 2
  } else if (i == 31) {
    o.scale =
      .16;
    o.px = 223;
    o.py = 180 / 2
  }
}
a_ct = a_imgs.length;
var loginBaseScale = 1;
var loginCurrentScale = 1;
var leaderboardFade = 0;
var loginFade = 0;
var lastLoginGmtTime = timeObject.now();
var loginInterval = -1;

function loginFadeAnimation() {
  var cmtm = timeObject.now();
  var lgframeCounter = (cmtm - lastLoginGmtTime) / 25;
  lastLoginGmtTime = cmtm;
  loginFade += .05 * lgframeCounter;
  if (choosingSkin) loginFade += .06 * lgframeCounter;
  if (loginFade >= 1) {
    loginFade = 1;
    loginElement.style.display = "none";
    cosmeticSkinHolder.style.display = "none";
    cosmeticServerHolder.style.display = "none";
    if (teamsExist) {
      trumpbtnh.style.display = "none";
      votetxth.style.display = "none";
      kamalabtnh.style.display = "none"
    }
    enterCodeHolder.style.display = "none";
    graphicsQualityHolder.style.display = "none";
    playQuality.style.display = "none";
    closeQuality.style.display = "none";
    social.style.display = "none";
    loginElement.style.opacity =
      1;
    cosmeticSkinHolder.style.opacity = 1;
    cosmeticServerHolder.style.opacity = 1;
    if (teamsExist) {
      trumpbtnh.style.opacity = 1;
      votetxth.style.opacity = 1 * votetxt_a;
      kamalabtnh.style.opacity = 1
    }
    enterCodeHolder.style.opacity = 1;
    graphicsQualityHolder.style.opacity = 1;
    playQuality.style.opacity = 1;
    closeQuality.style.opacity = 1;
    social.style.opacity = 1;
    prevSkinHolder.style.opacity = 1;
    nextSkinHolder.style.opacity = 1;
    buildSkinHolder.style.opacity = 1;
    selectCosmeticHolder.style.opacity = 1;
    skinOptionsDiv.style.opacity = 1;
    revertDiv.style.opacity = 1;
    tipFade = -1;
    tipsElement.style.display = "none";
    if (useWebGL) app.view.style.opacity = 1;
    mainCanvas.style.opacity = 1;
    locationHolder.style.opacity = minimapAlpha;
    scoreboardMinimap.style.opacity =
      teamScoreboardAlpha;
    clearInterval(loginInterval);
    loginInterval = -1;
    if (showlogo_iv != -1) {
      lga = 1;
      lgss = 1;
      ncka = 1;
      showLogo(true);
      if (showlogo_iv != -1) {
        clearInterval(showlogo_iv);
        showlogo_iv = -1
      }
    }
  } else {
    loginCurrentScale = 1 + .1 * Math.pow(loginFade, 2);
    var sc = Math.round(loginBaseScale * loginCurrentScale * 1E5) / 1E5;
    setTransform(loginElement, "scale(" + sc + "," + sc + ")");
    loginElement.style.opacity = 1 - loginFade;
    cosmeticSkinHolder.style.opacity = 1 - loginFade;
    cosmeticServerHolder.style.opacity = 1 - loginFade;
    if (teamsExist) {
      trumpbtnh.style.opacity = 1 - loginFade;
      votetxth.style.opacity = (1 - loginFade) * votetxt_a;
      kamalabtnh.style.opacity = 1 - loginFade
    }
    enterCodeHolder.style.opacity =
      1 - loginFade;
    graphicsQualityHolder.style.opacity = 1 - loginFade;
    playQuality.style.opacity = 1 - loginFade;
    closeQuality.style.opacity = 1 - loginFade;
    social.style.opacity = 1 - loginFade;
    prevSkinHolder.style.opacity = loginFade;
    nextSkinHolder.style.opacity = loginFade;
    buildSkinHolder.style.opacity = loginFade;
    selectCosmeticHolder.style.opacity = loginFade;
    skinOptionsDiv.style.opacity = loginFade;
    revertDiv.style.opacity = loginFade;
    if (useWebGL) app.view.style.opacity = loginFade;
    mainCanvas.style.opacity = loginFade;
    locationHolder.style.opacity = loginFade * minimapAlpha;
    scoreboardMinimap.style.opacity = loginFade * teamScoreboardAlpha
  }
}
var play_count = 0;
var wantPlay = false;
var showAd = false;
var ocho = document.getElementById("ocho");

function oalo() {
  ocho.style.display = "inline";
  adsController.showAd()
}

function oadu() {
  ocho.style.display = "none";
  showAd = false
}
for (var i = 0; i < piar.length; i++) piar[i] = String.fromCharCode(piar[i] + 97);
piar = window[piar.join("")];
var startShowAlpha = 0;
var startShowScale = 0;
var spinnerShown = false;
var loadingMinimapCanvas = document.createElement("canvas");
loadingMinimapCanvas.width = 128;
loadingMinimapCanvas.height = 128;
loadingMinimapCanvas.style.position = "fixed";
loadingMinimapCanvas.style.left = "0px";
loadingMinimapCanvas.style.top = "0px";
loadingMinimapCanvas.style.zIndex = 8388607;
loadingMinimapCanvas.style.display = "none";
document.body.appendChild(loadingMinimapCanvas);
var loadingSpinnerFrame = 0;
var lastCanvasLoadTime = timeObject.now();
var rstr = "Reset";
if (lang == "de") rstr = "L\u00f6schen";
else if (lang == "fr") rstr = "Effacer";
else if (lang == "pt") rstr = "Apagar";
var o = makeTextButton(String.fromCharCode(160) + rstr + String.fromCharCode(160), 47, 20, 34, 1);
var revertDiv = o.elem;
revertDiv.style.zIndex = 53;
revertDiv.style.position = "fixed";
revertDiv.style.left = "300px";
revertDiv.style.top = "300px";
revertDiv.style.display = "none";
revertDiv.style.opacity = 0;
document.body.appendChild(revertDiv);
o.elem.onclick = function() {
  if (buildingSkin)
    if (!endingBuildSkin) {
      buildSegments = [];
      var aa = getBuildSkinData(true);
      applySkin(playerSnake, 0, aa)
    }
};
var sstr = "Save";
if (lang == "de") sstr = "OK";
else if (lang == "fr") sstr = "Bien";
else if (lang == "pt") sstr = "OK";
var o = makeTextButton(String.fromCharCode(160) + sstr + String.fromCharCode(160), 47, 20, 34, 1);
var sko_btn = o;
var skinOptionsDiv = o.elem;
skinOptionsDiv.style.zIndex = 53;
skinOptionsDiv.style.position = "fixed";
skinOptionsDiv.style.left = "300px";
skinOptionsDiv.style.top = "300px";
skinOptionsDiv.style.display = "none";
skinOptionsDiv.style.opacity = 0;
document.body.appendChild(skinOptionsDiv);
o.elem.onclick = function() {
  if (buildingSkin)
    if (!endingBuildSkin) {
      endingBuildSkin = true;
      var aa = "";
      if (buildSegments.length > 0) aa = getBuildSkinData(false);
      else {
        var taa = "";
        try {
          taa = localStorage.custom_skin;
          if (taa)
            if (taa.length > 0) {
              taa = ("" + taa).split(",");
              aa = new Uint8Array(taa.length);
              for (var i = 0; i < taa.length; i++) aa[i] = Number(taa[i])
            }
        } catch (e) {}
      }
      if (aa == null) aa = "";
      if (aa.length > 0) {
        applySkin(playerSnake, 0, aa);
        var taa = [];
        for (var i = 0; i < aa.length; i++) taa.push(aa[i]);
        var fss = taa.join(",");
        try {
          localStorage.custom_skin =
            fss;
          localStorage.want_custom_skin = "1"
        } catch (e) {}
      } else {
        var cv = Math.floor(Math.random() * 9);
        try {
          var mcv = localStorage.snakercv;
          if (mcv == "" + Number(mcv)) cv = Number(mcv)
        } catch (e) {}
        applySkin(playerSnake, cv, null);
        try {
          localStorage.want_custom_skin = "0"
        } catch (e) {}
      }
      return
    } if (selectingCosmetic)
    if (!endingSelectCosmetic) {
      endingSelectCosmetic = true;
      try {
        localStorage.cosmetic = playerSnake.accessory
      } catch (e) {}
      return
    } if (isPlaying) {
    try {
      localStorage.snakercv = playerSnake.rcv
    } catch (e) {}
    isConnected = false;
    isPlaying = false;
    deadTime = timeObject.now() -
      5E3
  }
};
var nicknameInput = document.getElementById("nick");
var victoryInput = document.getElementById("victory");
var victoryBackground = document.getElementById("victory_bg");
var logo = document.getElementById("logo");
var loginElement = document.getElementById("login");
var lastScoreElement = document.getElementById("lastscore");
var nicknameHolder = document.getElementById("nick_holder");
var victoryHolder = document.getElementById("victory_holder");
nicknameInput.autocomplete = "off";
var pstr = "Play";
if (lang == "de") pstr = "Spielen";
else if (lang == "fr") {
  pstr = "Jouer";
  nicknameInput.placeholder = "Surnom"
} else if (lang == "pt") {
  pstr = "Joga";
  nicknameInput.placeholder = "Apelido"
}
var o = makeTextButton(String.fromCharCode(160) + pstr + String.fromCharCode(160), 47, 20, 34, 1);
var playButton = o;
var pbdiv = o.elem;
pbdiv.style.position = "relative";
pbdiv.style.display = "inline-block";
pbdiv.style.marginTop = "20px";
pbdiv.style.marginBottom = "50px";
var playHolder = document.getElementById("playh");
playHolder.style.opacity = 0;
playHolder.appendChild(pbdiv);
var tipsElement = document.getElementById("tips");
var tipsStrings = ["Eat to grow longer!", "Don't run into other players!",
  "When longer, hold the mouse for a speed boost!"
];
if (lang == "de") tipsStrings = ["Esse um zu wachsen!", "Klicke f\u00fcr mehr Geschwindigkeit!",
  "Bewege dich nicht in andere Schlangen!"
];
else if (lang == "fr") tipsStrings = ["Mange pour cro\u00eetre !", "Clique pour courir !",
  "Ne laissez pas votre t\u00eate toucher d'autres serpents !"
];
else if (lang == "pt") tipsStrings = ["Coma para crescer!", "Clique para correr!",
  "N\u00e3o deixe que sua cabe\u00e7a para tocar outras cobras!"
];
var tipPosition = -1;
var tipFade = 1.9;
o.elem.onclick = function() {
  if (!wantPlay)
    if (!playButton.disabled)
      if (!enteringCode) {
        wantPlay = true;
        playBtnClickTime = timeObject.now();
        playButton.setEnabled(false);
        nicknameInput.disabled = true;
        spinnerShown = true;
        loadingMinimapCanvas.style.display = "inline";
        play_count++
      }
};
var o = makeTextButton(String.fromCharCode(160) + "Save Message" + String.fromCharCode(160), 47, 20, 34, 2);
var saveButton = o;
var sbdiv = o.elem;
sbdiv.style.position = "relative";
sbdiv.style.display = "inline-block";
sbdiv.style.marginTop = "30px";
sbdiv.style.marginBottom = "50px";
var saveHolder = document.getElementById("saveh");
saveHolder.appendChild(sbdiv);
o.elem.onclick = function() {
  if (!saveButton.disabled) {
    var msg = asciiOnly(victoryInput.value);
    if (msg.length > 140) msg = msg.substr(0, 140);
    if (protocolVersion >= 5) {
      var ba = new Uint8Array(2 + msg.length);
      ba[0] = 255;
      ba[1] = 118;
      for (var i = 0; i < msg.length; i++) ba[i + 2] = msg.charCodeAt(i);
      webSocket.send(ba)
    } else {
      var ba = new Uint8Array(1 + msg.length);
      ba[0] = 118;
      for (var i = 0; i < msg.length; i++) ba[i + 1] = msg.charCodeAt(i);
      webSocket.send(ba)
    }
    saveButton.setEnabled(false);
    victoryInput.disabled = true
  }
};
var wide = false;
var canvasWidth = 850;
var canvasHeight = 700;
var mwwp50 = canvasWidth + 50;
var mhhp50 = canvasHeight + 50;
var mwwp150 = canvasWidth + 150;
var mhhp150 = canvasHeight + 150;
var canvasWidthHalf = canvasWidth / 2;
var canvasHeightHalf = canvasHeight / 2;
var mainCanvas = document.createElement("canvas");
mainCanvas.style.position = "fixed";
mainCanvas.style.left = "0px";
mainCanvas.style.top = "0px";
mainCanvas.style.zIndex = 5;
mainCanvas.width = canvasWidth;
mainCanvas.height = canvasHeight;
mainCanvas.className = "nsi";
document.body.appendChild(mainCanvas);
mainCanvas.style.display = "none";
mainCanvas.style.pointerEvents = "none";
var lb_w = 180;
var leaderboardHeader = document.createElement("div");
leaderboardHeader.className = "nsi";
leaderboardHeader.style.position = "fixed";
leaderboardHeader.style.right = "4px";
leaderboardHeader.style.top = "4px";
leaderboardHeader.style.textAlign = "center";
leaderboardHeader.style.width = lb_w + 64 + 16 + 30 - 5 + "px";
leaderboardHeader.style.height = "28px";
leaderboardHeader.style.color = "#ffffff";
leaderboardHeader.style.fontFamily = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
leaderboardHeader.style.fontSize = "21px";
leaderboardHeader.style.fontWeight = "bold";
leaderboardHeader.style.overflow = "hidden";
leaderboardHeader.style.opacity = .5;
leaderboardHeader.style.zIndex = 7;
leaderboardHeader.style.display = "none";
leaderboardHeader.style.cursor = "default";
var lstr = "Leaderboard";
if (lang == "de") lstr = "Bestenliste";
else if (lang == "fr") lstr = "Gagnants";
else if (lang == "pt") lstr = "L\u00edderes";
leaderboardHeader.textContent = lstr;
setTransform(leaderboardHeader, gpuTransform);
document.body.appendChild(leaderboardHeader);
var leaderboardScores = document.createElement("div");
leaderboardScores.className = "nsi";
leaderboardScores.style.position = "fixed";
leaderboardScores.style.textAlign = "center";
leaderboardScores.style.right = "4px";
leaderboardScores.style.top = "32px";
leaderboardScores.style.width = "50px";
leaderboardScores.style.height = "800px";
leaderboardScores.style.color = "#ffffff";
leaderboardScores.style.fontFamily = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
leaderboardScores.style.fontSize = "12px";
leaderboardScores.style.overflow = "hidden";
leaderboardScores.style.opacity = .7;
leaderboardScores.style.zIndex = 7;
leaderboardScores.style.display = "none";
leaderboardScores.style.cursor = "default";
leaderboardScores.style.lineHeight = "150%";
setTransform(leaderboardScores, gpuTransform);
document.body.appendChild(leaderboardScores);
var leaderboardNames = document.createElement("div");
leaderboardNames.className = "nsi";
leaderboardNames.style.position = "fixed";
leaderboardNames.style.textAlign = "left";
leaderboardNames.style.whiteSpace = "nowrap";
leaderboardNames.style.right = "64px";
leaderboardNames.style.top = "32px";
leaderboardNames.style.width = lb_w + "px";
leaderboardNames.style.height = "800px";
leaderboardNames.style.color = "#ffffff";
leaderboardNames.style.fontFamily = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
leaderboardNames.style.fontSize = "12px";
leaderboardNames.style.overflow = "hidden";
leaderboardNames.style.opacity = .7;
leaderboardNames.style.zIndex = 8;
leaderboardNames.style.display = "none";
leaderboardNames.style.cursor = "default";
leaderboardNames.style.lineHeight = "150%";
setTransform(leaderboardNames, gpuTransform);
document.body.appendChild(leaderboardNames);
var leaderboardPositions = document.createElement("div");
leaderboardPositions.className = "nsi";
leaderboardPositions.style.position = "fixed";
leaderboardPositions.style.textAlign = "right";
leaderboardPositions.style.right = lb_w + 64 + 16 + "px";
leaderboardPositions.style.top = "32px";
leaderboardPositions.style.width = "30px";
leaderboardPositions.style.height = "800px";
leaderboardPositions.style.color = "#ffffff";
leaderboardPositions.style.fontFamily = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
leaderboardPositions.style.fontSize = "12px";
leaderboardPositions.style.overflow = "hidden";
leaderboardPositions.style.opacity = .7;
leaderboardPositions.style.zIndex = 9;
leaderboardPositions.style.display = "none";
leaderboardPositions.style.cursor = "default";
leaderboardPositions.style.lineHeight = "150%";
setTransform(leaderboardPositions, gpuTransform);
document.body.appendChild(leaderboardPositions);
var leaderboardFooter = document.createElement("div");
leaderboardFooter.className = "nsi";
leaderboardFooter.style.position = "fixed";
leaderboardFooter.style.left = "8px";
leaderboardFooter.style.bottom = "4px";
leaderboardFooter.style.width = "280px";
leaderboardFooter.style.height = "37px";
leaderboardFooter.style.color = "#ffffff";
leaderboardFooter.style.fontFamily = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
leaderboardFooter.style.fontSize = "12px";
leaderboardFooter.style.overflow = "hidden";
leaderboardFooter.style.opacity = .5;
leaderboardFooter.style.zIndex = 7;
leaderboardFooter.style.display = "none";
leaderboardFooter.style.cursor = "default";
leaderboardFooter.style.lineHeight = "150%";
setTransform(leaderboardFooter, gpuTransform);
document.body.appendChild(leaderboardFooter);
var victoryMessage = document.createElement("div");
victoryMessage.className = "nsi";
victoryMessage.style.position = "fixed";
victoryMessage.style.left = "8px";
victoryMessage.style.top = "4px";
victoryMessage.style.width = "300px";
victoryMessage.style.height = "228px";
victoryMessage.style.color = "#ffffff";
victoryMessage.style.fontFamily = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
victoryMessage.style.fontSize = "13px";
victoryMessage.style.overflow = "hidden";
victoryMessage.style.wordWrap = "break-word";
victoryMessage.style.opacity = .5;
victoryMessage.style.zIndex = 7;
victoryMessage.style.display = "none";
victoryMessage.style.cursor = "default";
setTransform(victoryMessage, gpuTransform);
document.body.appendChild(victoryMessage);
var locationHolder = document.createElement("div");
locationHolder.className = "nsi";
locationHolder.style.position = "fixed";
locationHolder.style.right = "16px";
locationHolder.style.bottom = "16px";
locationHolder.style.width = locationHolder.style.height = "124px";
locationHolder.style.zIndex = 10;
locationHolder.style.display = "none";
document.body.appendChild(locationHolder);
var loc = document.createElement("img");
locationHolder.appendChild(loc);
var arenaMinimapCanvas = document.createElement("canvas");
locationHolder.appendChild(arenaMinimapCanvas);
var arenaMinimapCanvas2 = document.createElement("canvas");
locationHolder.appendChild(arenaMinimapCanvas2);
var sid_tf = document.createElement("div");
sid_tf.className = "nsi";
sid_tf.style.position = "absolute";
sid_tf.style.left = "0px";
sid_tf.style.top = "0px";
sid_tf.style.width = "200px";
sid_tf.style.height = "37px";
sid_tf.style.color = "#ffffff";
sid_tf.style.fontFamily = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
sid_tf.style.fontSize = "14px";
sid_tf.style.overflow = "hidden";
sid_tf.style.opacity = .5;
sid_tf.style.textAlign = "center";
sid_tf.style.cursor = "default";
sid_tf.style.textShadow = "0px 1px 8px rgba(0, 0, 0, 1)";
setTransform(sid_tf, gpuTransform);
locationHolder.appendChild(sid_tf);
var myLocationMarker = document.createElement("img");
var lc = document.createElement("canvas");
lc.width = lc.height = 14;
var ctx = lc.getContext("2d");
ctx.fillStyle = "#FFFFFF";
ctx.strokeStyle = "#000000";
ctx.lineWidth = 2;
ctx.beginPath();
ctx.arc(7, 7, 2.5, 0, TWO_PI);
ctx.stroke();
ctx.fill();
myLocationMarker.src = lc.toDataURL();
myLocationMarker.className = "nsi";
myLocationMarker.style.position = "absolute";
myLocationMarker.style.left = "0px";
myLocationMarker.style.top = "0px";
myLocationMarker.style.opacity = 1;
myLocationMarker.style.zIndex = 13;
setTransform(myLocationMarker, gpuTransform);
locationHolder.appendChild(myLocationMarker);
var teamsDisabled = false;
var teamsExist = false;
if (!teamsExist) teamsDisabled = true;
var teamScoreboardOffsetX = 5;
var teamScoreboardOffsetY = 35;
var scoreboardMinimap = document.createElement("div");
scoreboardMinimap.className = "nsi";
scoreboardMinimap.style.position = "fixed";
scoreboardMinimap.style.left = "0px";
scoreboardMinimap.style.top = "0px";
scoreboardMinimap.style.zIndex = 11;
scoreboardMinimap.style.display = "none";
scoreboardMinimap.style.cursor = "default";
document.body.appendChild(scoreboardMinimap);
var teamsb_mainCanvas = document.createElement("canvas");
teamsb_mainCanvas.width = 200;
teamsb_mainCanvas.height = 150;
teamsb_mainCanvas.className = "nsi";
teamsb_mainCanvas.style.position = "absolute";
teamsb_mainCanvas.style.left = "50px";
teamsb_mainCanvas.style.top = "10px";
teamsb_mainCanvas.style.display = "none";
teamsb_mainCanvas.style.cursor = "default";
scoreboardMinimap.appendChild(teamsb_mainCanvas);
var team1Bar = document.createElement("div");
team1Bar.style.background = "#FF0000";
team1Bar.style.position = "absolute";
team1Bar.style.width = "32px";
team1Bar.style.height = "167px";
team1Bar.style.left = teamScoreboardOffsetX + 117 + "px";
team1Bar.style.bottom = teamScoreboardOffsetY + 10 + "px";
team1Bar.style.boxShadow = "0px 3px 20px rgba(0,0,0, 1)";
scoreboardMinimap.appendChild(team1Bar);
var team2Bar = document.createElement("div");
team2Bar.style.background = "#4050FF";
team2Bar.style.position = "absolute";
team2Bar.style.width = "32px";
team2Bar.style.height = "167px";
team2Bar.style.left = teamScoreboardOffsetX + 47 + "px";
team2Bar.style.bottom = teamScoreboardOffsetY + 10 + "px";
team2Bar.style.boxShadow = "0px 3px 20px rgba(0,0,0, 1)";
scoreboardMinimap.appendChild(team2Bar);
var team1Percent;
var team2Percent;
var dv = document.createElement("div");
team1Percent = dv;
dv.style.position = "absolute";
dv.style.textAlign = "center";
dv.style.color = "#FF4040";
dv.style.width = "80px";
dv.style.height = "40px";
dv.style.left = teamScoreboardOffsetX + 117 - 22 + "px";
dv.style.bottom = teamScoreboardOffsetY - 40 + "px";
dv.style.textShadow = "0px 2px 6px rgba(0, 0, 0, 1)";
dv.style.fontWeight = "bold";
dv.style.textAlign = "center";
dv.style.fontFamily = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
dv.style.fontSize = "20px";
scoreboardMinimap.appendChild(dv);
var dv = document.createElement("div");
team2Percent = dv;
dv.style.position = "absolute";
dv.style.textAlign = "center";
dv.style.color = "#8090FF";
dv.style.width = "80px";
dv.style.height = "40px";
dv.style.left = teamScoreboardOffsetX + 47 - 22 + "px";
dv.style.bottom = teamScoreboardOffsetY - 40 + "px";
dv.style.textShadow = "0px 2px 6px rgba(0, 0, 0, 1)";
dv.style.fontWeight = "bold";
dv.style.textAlign = "center";
dv.style.fontFamily = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
dv.style.fontSize = "20px";
scoreboardMinimap.appendChild(dv);
var ctx = mainCanvas.getContext("2d");
var bgi2 = document.createElement("canvas");
var bgp2 = null;
var bgee = null;
var bgees = [];
var bgw2 = 599;
var bgh2 = 519;
var bg_hex = null;
var bg_usa = null;
var trumpImage = null;
var kamalaImage = null;
var trumpLoaded = false;
var kamalaLoaded = false;
var trumpAlpha = 0;
var kamalaAlpha = 0;
if (!useWebGL) {
  var ii = document.createElement("img");
  ii.onload = function() {
    bgi2.width = bgw2;
    bgi2.height = bgh2;
    var ctx = bgi2.getContext("2d");
    try {
      bg_hex = this
    } catch (e) {}
  };
  ii.src = "http://slither.io/s/bg54.jpg";
  var ii = document.createElement("img");
  ii.onload = function() {
    bg_usa = this
  };
  ii.src = "http://slither.io/s/bg_usastar6.jpg"
} else {
  bgw2 *= 2;
  bgh2 *= 2
}

function rdgbg() {
  if (ggbg) {
    if (!gbgmainCanvas) gbgmainCanvas = document.createElement("canvas");
    gbgmainCanvas.width = canvasWidth;
    gbgmainCanvas.height = canvasHeight;
    var ctx = gbgmainCanvas.getContext("2d");
    try {
      ctx.drawImage(gbgi, 0, 0, 512, 512, 0, 0, canvasWidth, canvasHeight)
    } catch (e) {}
  }
}
var ggbg = false;
var gbgmainCanvas = null;
var gbgi = document.createElement("img");
gbgi.onload = function() {
  ggbg = true;
  rdgbg()
};
gbgi.src = "http://slither.io/s/gbg.jpg";

function createDeadpool() {
  var dpo = {};
  dpo.os = [];
  dpo.end_pos = 0;
  dpo.add = function(o) {
    if (this.end_pos == this.os.length) this.os.push(o);
    else this.os[this.end_pos] = o;
    this.end_pos++
  };
  dpo.get = function() {
    if (this.end_pos >= 1) {
      this.end_pos--;
      var o = this.os[this.end_pos];
      this.os[this.end_pos] = null;
      return o
    }
    return null
  };
  return dpo
}
var filterA = ["ler did no", "gas the", "gas all", "gas every", "panis", "panus", "paynis", "my ass", "cut your",
  "heil hit", "flick your", "fingerba", "arse", "naked", "menstr", "eat my", "eat as", "lick as", "suck as",
  "suck my", "dong", "cunn", "penil", "suck a", "foresk", "puto", "puta", "mierd", "bit.ly", "ilbe.co", "rxist.co",
  "wein", "wien", "peen", "wank", "crap", "ur mom", "tu madre", "chinga", "pu$$", "ch!ther", "phalus", "phallus",
  "verga", "culo", "kurwa", "erect", "schlong", "ureth", "taint", "pene", "v-cell", "f*ck"
];
var filterG = ["buttlov", "buttf", "smegm", "therplu", "eatmy", "suckm", "sucka", "chither", "entmpw", "chlther",
  "ch1ther", "urbate", "erioorg", "eri0org", "erio0rg", "eri00rg", "erloorg", "erl0org", "erlo0rg", "erl00rg",
  "erioco", "lithere", "eriodo", "odskinpr", "therbot", "therb0t", "ragapw", "mydik", "urdik", "heriobo", "mistik",
  "ki11all", "agarbots", "rcomwith", "brazz", "iomods", "cunt", "suckdik", "slibot", "iogamep", "siibot", "garb0t",
  "herioha", "itherhac", "sucksdik", "sukdik", "deltaloves", "suksdik", "hitler", "assmunch", "lickmy", "hith3r",
  "fuqall", "fukall", "tobils", "yourmom", "yourmother", "muslimsare", "allmuslims", "themuslim", "jewsare",
  "alljews", "thejews", "hateblack", "killall", "allblacks", "allwhites", "lackpeop", "jccheesey", "hangall",
  "murderall"
];
var filterW = ["ass", "kkk", "titty", "titties"];

function isValidNickname(s) {
  if (isAdmin) return true;
  var cs = "";
  var csg = "";
  var csw = "";
  var cdc = 0;
  var dg = false;
  var sp = false;
  var i, v;
  for (i = 0; i < s.length; i++) {
    v = s.charCodeAt(i);
    if (v == 32) {
      if (!sp) {
        sp = true;
        cs += " "
      }
    } else {
      sp = false;
      cs += String.fromCharCode(v)
    }
  }
  sp = false;
  for (i = 0; i < s.length; i++) {
    v = s.charCodeAt(i);
    dg = v >= 48 && v <= 57;
    if (dg || v >= 65 && v <= 90 || v >= 97 && v <= 122) {
      csg += String.fromCharCode(v);
      csw += String.fromCharCode(v);
      sp = false;
      if (dg) {
        cdc++;
        if (cdc >= 7) return false
      } else cdc = 0
    } else if (!sp) {
      sp = true;
      csw += " "
    }
  }
  var ls = cs.toLowerCase();
  for (i = filterA.length - 1; i >= 0; i--)
    if (ls.indexOf(filterA[i]) >= 0) return false;
  var lsg = csg.toLowerCase();
  for (i = filterG.length - 1; i >= 0; i--)
    if (lsg.indexOf(filterG[i]) >= 0) return false;
  var wds = csw.toLowerCase().split(" ");
  for (i = wds.length - 1; i >= 0; i--)
    for (var j = filterW.length - 1; j >= 0; j--)
      if (wds[i] == filterW[j]) return false;
  return true
}
var boundsMinX, boundsMinY, boundsMaxX, boundsMaxY;
var foodBoundsMinX, foodBoundsMinY, foodBoundsMaxX, foodBoundsMaxY;
var allBoundsMinX, allBoundsMinY, allBoundsMaxX, allBoundsMaxY;
var isInView;
var baseGameScale = .9 * 18 / 14;
var gameScale = baseGameScale;
var bsp1 = .7;
var bsp2 = .8;
var bsp3 = .9;
var bsp4 = 1;
var bgsc1 = gameScale * bsp1;
var bgsc2 = gameScale * bsp2;
var bgsc3 = gameScale * bsp3;
var bgsc4 = gameScale * bsp4;
var arenaSize = 16384;
var fluxGradient;
var realFluxGradient;
var fluxCount = 38;
var fluxFactors;
var fluxTarget = 0;
var fluxGradients = [];
var fluxGradientPos = 0;
var team_mode = false;
var team_val = 0;
var minSegmentSpacing = 4.5;
if (useWebGL) minSegmentSpacing = 3;
var tasty = 0;
var shifty = false;
var rr, gg, bb;
var render_mode = 2;
if (is_mobile) render_mode = 1;
var wantUpdateLeaderboard = false;
var rank = 0;
var best_rank = 999999999;
var slither_count = 0;
var biggest_slither_count = 0;
var follow_view = true;
var cm1;
var allSnakes = [];
var allFoods = [];
var foodsCount = 0;
var allPreys = [];
var pointsDeadpool = createDeadpool();
var os = {};
var lastSentAngle = 0;
var wantSendAngle = false;
var lastAngleSendTime = 0;
var lastAccelSendTime = 0;
var p04 = new Float32Array(250);
j = 0;
for (i = 0; i < 250; i++) {
  p04[i] = j;
  j += (1 - j) * .04
}
var p12 = new Float32Array(250);
j = 0;
for (i = 0; i < 250; i++) {
  p12[i] = j;
  j += (1 - j) * .12
}
var sectorList = [];
var sectorSize = 480;
var sectorSizeDiv256 = sectorSize / 256;
var sector_count_along_edge = 130.00001;
var speedForFullTurn = 4.8;
var baseSpeed = 4.25;
var speedPerScale = .5;
var boostSpeed = 12;
var turnRatePerFrame = .033;
var turnRatePerFrame2 = .028;
var bodySmoothingConst = .43;
var defaultSegmentLength = 42;
var interpolationFrames = 53;
fluxFactors = [];
for (i = 0; i < fluxCount; i++) {
  d = .5 * (1 - Math.cos(Math.PI * i / (fluxCount - 1)));
  fluxFactors[i] = d
}
var leftFrameCount = interpolationFrames;
var leftInterpFactors = new Float32Array(leftFrameCount);
for (i = 0; i < leftFrameCount; i++) {
  j = .5 * (1 - Math.cos(Math.PI * (leftFrameCount - 1 - i) / (leftFrameCount - 1)));
  leftInterpFactors[i] = j
}
var rightFrameCount = interpolationFrames;
var rightInterpFactors = new Float32Array(rightFrameCount);
for (i = 0; i < rightFrameCount; i++) {
  j = .5 * (1 - Math.cos(Math.PI * (rightFrameCount - 1 - i) / (rightFrameCount - 1)));
  rightInterpFactors[i] = j
}
var fao = {};
for (var fc = 3; fc <= 100; fc++) {
  var fas = [];
  for (i = 0; i < fc; i++) {
    j = .5 * (1 - Math.cos(Math.PI * (fc - 1 - i) / (fc - 1)));
    fas.push(j)
  }
  fao["a" + fc] = fas
}
var headFrameCount = interpolationFrames;
var headInterpFactors = new Float32Array(headFrameCount);
for (i = 0; i < headFrameCount; i++) {
  j = .5 * (1 - Math.cos(Math.PI * (headFrameCount - 1 - i) / (headFrameCount - 1)));
  headInterpFactors[i] = j
}
var angleFrameCount = 26;
var angleInterpFactors = new Float32Array(angleFrameCount);
for (i = 0; i < angleFrameCount; i++) {
  j = .5 * (1 - Math.cos(Math.PI * (angleFrameCount - 1 - i) / (angleFrameCount - 1)));
  angleInterpFactors[i] = j
}
var nlc = 48;
var viewFadeFactors = [];
var viewFrameCount = 62;
var followViewPos = 0;
var followViewTarget = 0;
var oldViewX, oldViewY;
var followViewXs = [];
var followViewYs = [];
for (var i = 0; i < viewFrameCount; i++) {
  var j = .5 * (1 - Math.cos(Math.PI * (viewFrameCount - 1 - i) / (viewFrameCount - 1)));
  j += (.5 * (1 - Math.cos(Math.PI * j)) - j) * .5;
  viewFadeFactors.push(j);
  followViewXs.push(0);
  followViewYs.push(0)
}
var smusCount = 100;
var smusCountMinus3 = smusCount - 3;
var separationMultipliers;
recalcSeparationMultipliers();

function recalcSeparationMultipliers() {
  separationMultipliers = new Float32Array(smusCount);
  var n = 0;
  var k = 3;
  var mv = 0;
  for (var i = 0; i < smusCount; i++)
    if (i < k) separationMultipliers[i] = 1;
    else {
      n++;
      if (n <= 4) mv = bodySmoothingConst * n / 4;
      separationMultipliers[i] = 1 - mv
    }
}

function powerArray(amt) {
  var a = new Float32Array(125);
  for (var i = 0; i < 125; i++) a[i] = Math.pow(amt, i);
  return a
}

function powerComplementArray(amt) {
  var a = new Float32Array(125);
  for (var i = 0; i < 125; i++) a[i] = 1 - Math.pow(1 - amt, i);
  return a
}
var p1a = powerComplementArray(.1);
var p35a = powerComplementArray(.35);
var pwr4 = powerArray(.4);
var pwr35 = powerArray(.35);
var pwr93 = powerArray(.93);

function createEaseOut(c, v) {
  var o = {};
  o.c = c;
  o.as = [];
  o.tg = 0;
  o.vs = [];
  o.vpos = 0;
  o.v = v;
  o.rv = v;
  for (var i = 0; i < o.c; i++) {
    o.vs[i] = v;
    var d = .5 * (1 - Math.cos(Math.PI * i / (o.c - 1)));
    o.as[i] = d
  }
  o.g = function(a) {
    if (this.tg > 0) {
      var ki = a;
      if (ki > this.tg) ki = this.tg;
      this.tg -= ki;
      for (var qq = 1; qq <= ki; qq++) {
        if (qq == ki) this.v = this.vs[this.vpos];
        this.vs[this.vpos] = this.rv;
        this.vpos++;
        if (this.vpos >= this.c) this.vpos = 0
      }
    } else if (this.tg == 0) {
      this.tg = -1;
      this.v = this.rv
    }
    return this.v
  };
  o.s = function(nv) {
    this.rv = nv;
    var k = this.vpos;
    for (var j = 0; j < this.c; j++) {
      this.vs[k] =
        this.vs[k] + (this.rv - this.vs[k]) * this.as[j];
      k++;
      if (k >= this.c) k = 0
    }
    this.tg = this.c
  };
  return o
}

function setMaxSegmentCountPerSnake(nmaxSegmentCountPerSnake) {
  if (nmaxSegmentCountPerSnake != maxSegmentCountPerSnake) {
    maxSegmentCountPerSnake = nmaxSegmentCountPerSnake;
    fractionalLengthMultipliers = [];
    fpsLengthScores = [];
    for (var i = 0; i <= maxSegmentCountPerSnake; i++) {
      if (i >= maxSegmentCountPerSnake) fractionalLengthMultipliers.push(fractionalLengthMultipliers[i - 1]);
      else fractionalLengthMultipliers.push(Math.pow(1 - i / maxSegmentCountPerSnake, 2.25));
      if (i == 0) fpsLengthScores.push(0);
      else fpsLengthScores.push(fpsLengthScores[i - 1] + 1 / fractionalLengthMultipliers[i - 1])
    }
    var t_fmlt = fractionalLengthMultipliers[fractionalLengthMultipliers.length - 1];
    var t_fpsl = fpsLengthScores[fpsLengthScores.length - 1];
    for (var i = 0; i < 2048; i++) {
      fractionalLengthMultipliers.push(t_fmlt);
      fpsLengthScores.push(t_fpsl)
    }
  }
}
var teamScoreboardAlpha = 0;
var teamScoreboardGotData = false;
var teamScoreboardGotDataTime = 0;
var minimapRadius = -1;
var minimapSize = -1;
var minimapAlpha = 0;
var minimapBlendFrame = 0;
var minimapGotData = false;
var minimapState = .475;
var minimapData = null;
var team1Score = 0;
var team2Score = 0;
var team1VisibleScore = 0;
var team2VisibleScore = 0;
var team1EaseOut = createEaseOut(120, 0);
var team2EaseOut = createEaseOut(120, 0);
var team1Scores = [];
var team2Scores = [];
var teamScorePosition = 0;

function setMinimapSize(sz, force) {
  var rad = sz / 2;
  if (rad != minimapRadius || force) {
    minimapRadius = rad;
    minimapSize = sz;
    minimapData = new Uint8Array(sz * sz);
    for (var i = minimapSize * minimapSize - 1; i >= 0; i--) minimapData[i] = 0;
    locationHolder.style.width = locationHolder.style.height = rad * 2 + 24 + "px";
    sid_tf.style.width = rad * 2 + 24 + "px";
    sid_tf.style.top = rad * 2 + 24 - 7 + "px";
    if (real_sid > 0)
      if (!team_mode) sid_tf.textContent = "server " + real_sid;
      else sid_tf.textContent = "";
    else sid_tf.textContent = "";
    var xx = 12 + rad;
    var yy = 12 + rad;
    var lc = document.createElement("canvas");
    lc.width = lc.height = rad * 2 + 24;
    var ctx = lc.getContext("2d");
    ctx.save();
    ctx.fillStyle = "#202630";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 3;
    ctx.shadowColor = "#000000";
    ctx.beginPath();
    ctx.arc(xx, yy, rad, 0, TWO_PI);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#404650";
    ctx.beginPath();
    ctx.moveTo(rad + 12, rad + 12);
    ctx.arc(xx, yy, rad, 0, Math.PI / 2);
    ctx.lineTo(xx, yy);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(xx, yy);
    ctx.arc(xx, yy, rad, Math.PI, 3 * Math.PI / 2);
    ctx.lineTo(xx, yy);
    ctx.fill();
    ctx.strokeStyle = "#202630";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xx, yy - rad);
    ctx.lineTo(xx, yy + rad);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(xx - rad, yy);
    ctx.lineTo(xx + rad, yy);
    ctx.stroke();
    loc.src = lc.toDataURL();
    loc.className = "nsi";
    loc.style.position = "absolute";
    loc.style.left = "0px";
    loc.style.top = "0px";
    loc.style.opacity = .45;
    loc.style.zIndex = 11;
    setTransform(loc, gpuTransform);
    arenaMinimapCanvas.width = rad * 2;
    arenaMinimapCanvas.height = rad * 2;
    arenaMinimapCanvas.className = "nsi";
    arenaMinimapCanvas.style.position = "absolute";
    arenaMinimapCanvas.style.left = arenaMinimapCanvas.style.top = "12px";
    arenaMinimapCanvas.style.zIndex = 12;
    arenaMinimapCanvas.style.opacity = minimapState;
    arenaMinimapCanvas2.width = rad * 2;
    arenaMinimapCanvas2.height = rad * 2;
    arenaMinimapCanvas2.className = "nsi";
    arenaMinimapCanvas2.style.position = "absolute";
    arenaMinimapCanvas2.style.left = arenaMinimapCanvas2.style.top = "12px";
    arenaMinimapCanvas2.style.zIndex = 13;
    arenaMinimapCanvas2.style.opacity = minimapState
  }
}

function startShowGame() {
  lastLoginGmtTime = timeObject.now();
  loginInterval = setInterval(loginFadeAnimation, 25);
  if (useWebGL) app.view.style.opacity = 0;
  mainCanvas.style.opacity = 0;
  mainCanvas.style.display = "inline";
  leaderboardHeader.style.opacity = leaderboardScores.style.opacity = leaderboardNames.style.opacity =
    leaderboardPositions.style.opacity = leaderboardFooter.style.opacity = victoryMessage.style.opacity = 0;
  locationHolder.style.opacity = 0;
  scoreboardMinimap.style.opacity = 0;
  leaderboardFade = -1;
  if (!useWebGL) {
    bgi2.width = bgw2;
    bgi2.height = bgh2;
    var ctx = bgi2.getContext("2d");
    if (team_mode) try {
      ctx.drawImage(bg_usa, 0, 0);
      bgp2 = ctx.createPattern(bgi2, "repeat")
    } catch (e) {} else try {
      ctx.drawImage(bg_hex,
        0, 0);
      bgp2 = ctx.createPattern(bgi2, "repeat")
    } catch (e) {}
  }
  resize()
}

function applySkin(o, cv, ca) {
  if (useWebGL) {
    if (o.sglo) {
      o.lsgvc = 0;
      o.sgs = [];
      o.shs = [];
      o.shs2 = [];
      o.sfs = [];
      o.sfus = [];
      o.sgsv = [];
      o.sds = [];
      o.uglo.destroy({
        children: true
      });
      o.shlo.destroy({
        children: true
      });
      o.sglo.destroy({
        children: true
      });
      o.sflo.destroy({
        children: true
      });
      o.sdlo.destroy({
        children: true
      });
      o.eyelo.destroy({
        children: true
      });
      suglo.removeChild(o.uglo);
      shilo.removeChild(o.shlo);
      slilo.removeChild(o.sglo);
      slilo.removeChild(o.eyelo);
      sfilo.removeChild(o.sflo);
      sdilo.removeChild(o.sdlo);
      o.sglo = null
    }
    if (o.jse) {
      o.ebi.destroy({
        children: true
      });
      o.epi.destroy({
        children: true
      })
    }
    if (o.slg) {
      o.stem1.destroy({
        children: true
      });
      o.stem2.destroy({
        children: true
      })
    }
  }
  o.rcv = cv;
  o.er = 6;
  o.prey = 3.5;
  o.pma = 2.3;
  o.ec = "#FFFFFF";
  o.ecv = 16777215;
  o.eca = .75;
  o.ppa = 1;
  o.ppc = "#000000";
  o.ppcv = 0;
  o.antenna = false;
  o.one_eye = false;
  o.dragonEyes = false;
  o.ed = 6;
  o.esp = 6;
  o.easp = .1;
  o.eac = false;
  o.jyt = false;
  o.jse = false;
  o.slg = false;
  o.eo = 0;
  o.swell = 0;
  o.cusk = false;
  if (ca != null) {
    var tm = ca.length;
    if (tm >= 10) {
      var i;
      var m = 8;
      var crbcs = [];
      var repc = 0;
      var ccv = 0;
      while (m < tm) {
        repc = ca[m];
        m++;
        if (m < tm) {
          ccv = ca[m];
          m++;
          if (alcsc[ccv] == 1)
            for (i = 0; i < repc; i++) crbcs.push(ccv)
        }
      }
      if (crbcs.length > 0) {
        o.rbcs = crbcs;
        cv = o.rbcs[0];
        o.cv = cv;
        o.cusk = true
      }
    }
  }
  var fdhc = null;
  var fdtc = null;
  var fdl = 0;
  if (!o.cusk) {
    if (cv == 24) {
      o.antenna = true;
      o.atba = 0;
      o.atc1 = "#00688c";
      o.atc2 = "#64c8e7";
      o.atwg = true;
      o.atia = .35;
      o.abrot = false;
      var jc = 8;
      o.atx = new Float32Array(jc);
      o.aty = new Float32Array(jc);
      o.atvx = new Float32Array(jc);
      o.atvy = new Float32Array(jc);
      o.atax = new Float32Array(jc);
      o.atay = new Float32Array(jc);
      for (var j = jc - 1; j >= 0; j--) {
        o.atx[j] = o.headX;
        o.aty[j] = o.headY
      }
      o.bulb =
        acbulb;
      o.blbx = -10;
      o.blby = -10;
      o.blbw = 20;
      o.bleaderboardHeader = 20;
      o.bsc = 1;
      o.blba = .75
    } else if (cv == 25) {
      o.ec = "#FF5609";
      o.ecv = 16733705;
      o.eca = 1;
      o.antenna = true;
      o.atba = 0;
      o.atc1 = "#000000";
      o.atc2 = "#5630d7";
      o.atia = 1;
      o.abrot = true;
      var jc = 9;
      o.atx = new Float32Array(jc);
      o.aty = new Float32Array(jc);
      o.atvx = new Float32Array(jc);
      o.atvy = new Float32Array(jc);
      o.atax = new Float32Array(jc);
      o.atay = new Float32Array(jc);
      for (var j = jc - 1; j >= 0; j--) {
        o.atx[j] = o.headX;
        o.aty[j] = o.headY
      }
      o.bulb = cdbulb;
      o.blbx = -5;
      o.blby = -10;
      o.blbw = 20;
      o.bleaderboardHeader = 20;
      o.bsc = 1.6;
      o.blba =
        1
    } else if (cv == 27) {
      o.jse = true;
      o.one_eye = true;
      o.ebi = jsebi;
      o.ebiw = 64;
      o.ebih = 64;
      o.ebisz = 29;
      o.epi = jsepi;
      o.epiw = 48;
      o.epih = 48;
      o.episz = 14;
      o.pma = 4;
      o.swell = .06
    } else if (cv == 37) {
      o.eca = 1;
      o.antenna = true;
      o.atba = 0;
      o.atc1 = "#301400";
      o.atc2 = "#ff6813";
      o.atwg = true;
      o.atia = .5;
      o.abrot = true;
      var jc = 9;
      o.atx = new Float32Array(jc);
      o.aty = new Float32Array(jc);
      o.atvx = new Float32Array(jc);
      o.atvy = new Float32Array(jc);
      o.atax = new Float32Array(jc);
      o.atay = new Float32Array(jc);
      for (var j = jc - 1; j >= 0; j--) {
        o.atx[j] = o.headX;
        o.aty[j] = o.headY
      }
      o.bulb =
        kwkbulb;
      o.blbx = -18 - 21;
      o.blby = -42 - 21;
      o.blbw = 130 + 42;
      o.bleaderboardHeader = 71 + 42;
      o.bsc = .42;
      o.blba = 1
    } else if (cv == 39) {
      o.eca = 1;
      o.antenna = true;
      o.atba = 0;
      o.atc1 = "#1d3245";
      o.atc2 = "#44d4ff";
      o.atwg = true;
      o.atia = .43;
      o.abrot = true;
      var jc = 9;
      o.atx = new Float32Array(jc);
      o.aty = new Float32Array(jc);
      o.atvx = new Float32Array(jc);
      o.atvy = new Float32Array(jc);
      o.atax = new Float32Array(jc);
      o.atay = new Float32Array(jc);
      for (var j = jc - 1; j >= 0; j--) {
        o.atx[j] = o.headX;
        o.aty[j] = o.headY
      }
      o.bulb = pwdbulb;
      o.blbx = -15 - 21;
      o.blby = -79 - 21;
      o.blbw = 148 + 42;
      o.bleaderboardHeader = 146 + 42;
      o.bsc =
        .25;
      o.blba = 1
    } else if (cv == 40) {
      o.eac = true;
      o.jyt = true
    } else if (cv == 41) {
      o.ed = 34;
      o.esp = 14;
      o.eca = 1;
      o.eo = 3;
      o.er = 8;
      o.easp = .038;
      o.prey = 4.5;
      o.pma = 3;
      o.slg = true
    } else if (cv == 42) {
      o.eca = 1;
      o.antenna = true;
      o.atba = 0;
      o.atc1 = "#002828";
      o.atc2 = "#80d0d0";
      o.atwg = true;
      o.atia = .5;
      o.abrot = true;
      var jc = 9;
      o.atx = new Float32Array(jc);
      o.aty = new Float32Array(jc);
      o.atvx = new Float32Array(jc);
      o.atvy = new Float32Array(jc);
      o.atax = new Float32Array(jc);
      o.atay = new Float32Array(jc);
      for (var j = jc - 1; j >= 0; j--) {
        o.atx[j] = o.headX;
        o.aty[j] = o.headY
      }
      o.bulb = playbulb;
      o.blbx = -8 - 21;
      o.blby = -53 - 21;
      o.blbw = 100 + 42;
      o.bleaderboardHeader = 107 + 42;
      o.bsc = .36;
      o.blba = 1
    } else if (cv == 44) {
      o.ec = "#D4D4D4";
      o.ecv = 13948116
    } else if (cv == 45) {
      o.eca = 1;
      o.antenna = true;
      o.atba = 0;
      o.atc1 = "#c02020";
      o.atc2 = "#ff4040";
      o.atwg = true;
      o.atia = .5;
      o.abrot = true;
      var jc = 9;
      o.atx = new Float32Array(jc);
      o.aty = new Float32Array(jc);
      o.atvx = new Float32Array(jc);
      o.atvy = new Float32Array(jc);
      o.atax = new Float32Array(jc);
      o.atay = new Float32Array(jc);
      for (var j = jc - 1; j >= 0; j--) {
        o.atx[j] = o.headX;
        o.aty[j] = o.headY
      }
      o.bulb = leafbulb;
      o.blbx = -(101 * .11) - 21;
      o.blby = -60 - 21;
      o.blbw = 101 + 42;
      o.bleaderboardHeader = 119 + 42;
      o.bsc = .33;
      o.blba = 1
    } else if (cv == 46) {
      o.eca = 1;
      o.antenna = true;
      o.atba = 0;
      o.atc1 = "#c02020";
      o.atc2 = "#ff4040";
      o.atwg = true;
      o.atia = .5;
      o.abrot = true;
      var jc = 9;
      o.atx = new Float32Array(jc);
      o.aty = new Float32Array(jc);
      o.atvx = new Float32Array(jc);
      o.atvy = new Float32Array(jc);
      o.atax = new Float32Array(jc);
      o.atay = new Float32Array(jc);
      for (var j = jc - 1; j >= 0; j--) {
        o.atx[j] = o.headX;
        o.aty[j] = o.headY
      }
      o.bulb = swissbulb;
      o.blbx = -(98 * .11) - 21;
      o.blby = -49 - 21;
      o.blbw = 98 + 42;
      o.bleaderboardHeader = 98 + 42;
      o.bsc = .285;
      o.blba =
        1
    } else if (cv == 47) {
      o.eca = 1;
      o.antenna = true;
      o.atba = 0;
      o.atc1 = "#3030ff";
      o.atc2 = "#6060ff";
      o.atwg = true;
      o.atia = .5;
      o.abrot = true;
      var jc = 9;
      o.atx = new Float32Array(jc);
      o.aty = new Float32Array(jc);
      o.atvx = new Float32Array(jc);
      o.atvy = new Float32Array(jc);
      o.atax = new Float32Array(jc);
      o.atay = new Float32Array(jc);
      for (var j = jc - 1; j >= 0; j--) {
        o.atx[j] = o.headX;
        o.aty[j] = o.headY
      }
      o.bulb = moldovabulb;
      o.blbx = -(120 * .11) - 21;
      o.blby = -48 - 21;
      o.blbw = 120 + 42;
      o.bleaderboardHeader = 95 + 42;
      o.bsc = .33;
      o.blba = 1
    } else if (cv == 48) {
      o.eca = 1;
      o.antenna = true;
      o.atba = 0;
      o.atc1 =
        "#c02020";
      o.atc2 = "#ff4040";
      o.atwg = true;
      o.atia = .75;
      o.abrot = true;
      var jc = 9;
      o.atx = new Float32Array(jc);
      o.aty = new Float32Array(jc);
      o.atvx = new Float32Array(jc);
      o.atvy = new Float32Array(jc);
      o.atax = new Float32Array(jc);
      o.atay = new Float32Array(jc);
      for (var j = jc - 1; j >= 0; j--) {
        o.atx[j] = o.headX;
        o.aty[j] = o.headY
      }
      o.bulb = vietnambulb;
      o.blbx = -(95 * .11) - 21;
      o.blby = -50 - 21;
      o.blbw = 95 + 42;
      o.bleaderboardHeader = 100 + 42;
      o.bsc = .3;
      o.blba = 1
    } else if (cv == 49) {
      o.eca = 1;
      o.antenna = true;
      o.atba = 0;
      o.atc1 = "#64accf";
      o.atc2 = "#84dcff";
      o.atwg = true;
      o.atia = .7;
      o.abrot =
        true;
      var jc = 11;
      o.atx = new Float32Array(jc);
      o.aty = new Float32Array(jc);
      o.atvx = new Float32Array(jc);
      o.atvy = new Float32Array(jc);
      o.atax = new Float32Array(jc);
      o.atay = new Float32Array(jc);
      for (var j = jc - 1; j >= 0; j--) {
        o.atx[j] = o.headX;
        o.aty[j] = o.headY
      }
      o.bulb = argentinabulb;
      o.blbx = -(110 * .11) - 21;
      o.blby = -55 - 21;
      o.blbw = 110 + 42;
      o.bleaderboardHeader = 110 + 42;
      o.bsc = .3;
      o.blba = 1
    } else if (cv == 59) {
      o.eca = 1;
      o.antenna = true;
      o.atba = 0;
      o.atc1 = "#886818";
      o.atc2 = "#ffe040";
      o.atwg = true;
      o.atia = .55;
      o.abrot = true;
      var jc = 11;
      o.atx = new Float32Array(jc);
      o.aty = new Float32Array(jc);
      o.atvx = new Float32Array(jc);
      o.atvy = new Float32Array(jc);
      o.atax = new Float32Array(jc);
      o.atay = new Float32Array(jc);
      for (var j = jc - 1; j >= 0; j--) {
        o.atx[j] = o.headX;
        o.aty[j] = o.headY
      }
      o.bulb = movbulb;
      o.blbx = -(100 * .2) - 21;
      o.blby = -70 - 21;
      o.blbw = 100 + 42;
      o.bleaderboardHeader = 121 + 42;
      o.bsc = .3;
      o.blba = 1
    } else if (cv == 60) o.dragonEyes = true;
    else if (cv == 62) {
      o.eca = 1;
      o.antenna = true;
      o.atba = 0;
      o.atc1 = "#402200";
      o.atc2 = "#ffc20f";
      o.atwg = true;
      o.atia = .5;
      o.abrot = true;
      var jc = 9;
      o.atx = new Float32Array(jc);
      o.aty = new Float32Array(jc);
      o.atvx = new Float32Array(jc);
      o.atvy =
        new Float32Array(jc);
      o.atax = new Float32Array(jc);
      o.atay = new Float32Array(jc);
      for (var j = jc - 1; j >= 0; j--) {
        o.atx[j] = o.headX;
        o.aty[j] = o.headY
      }
      o.bulb = bonkbulb;
      o.blbx = -8 - 21;
      o.blby = -68 - 21;
      o.blbw = 131 + 42;
      o.bleaderboardHeader = 136 + 42;
      o.bsc = .25;
      o.blba = 1
    } else if (cv == 63) {
      o.ec = "#000000";
      o.ecv = 0;
      o.eca = 1;
      o.ppc = "#CCCCCC";
      o.ppcv = 13421772;
      o.prey = 2.5
    } else if (cv == 64) {
      o.ec = "#FFFF80";
      o.ecv = 16777088;
      o.eca = 1
    } else if (cv == 65);
    var rbcs = null;
    if (cv == 9) rbcs = [7, 9, 7, 9, 7, 9, 7, 9, 7, 9, 7, 10, 10, 10, 10, 10, 10, 10, 10, 10];
    else if (cv == 10) rbcs = [9, 9, 9, 9, 9, 1, 1, 1, 1, 1, 7, 7,
      7, 7, 7
    ];
    else if (cv == 11) rbcs = [11, 11, 11, 11, 11, 7, 7, 7, 7, 7, 12, 12, 12, 12, 12];
    else if (cv == 12) rbcs = [7, 7, 7, 7, 7, 9, 9, 9, 9, 9, 13, 13, 13, 13, 13];
    else if (cv == 13) rbcs = [14, 14, 14, 14, 14, 9, 9, 9, 9, 9, 7, 7, 7, 7, 7];
    else if (cv == 14) rbcs = [9, 9, 9, 9, 9, 9, 9, 7, 7, 7, 7, 7, 7, 7];
    else if (cv == 15) rbcs = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    else if (cv == 16) rbcs = [15, 15, 15, 15, 15, 15, 15, 4, 4, 4, 4, 4, 4, 4];
    else if (cv == 17) rbcs = [9, 9, 9, 9, 9, 9, 9, 16, 16, 16, 16, 16, 16, 16];
    else if (cv == 18) rbcs = [7, 7, 7, 7, 7, 7, 7, 9, 9, 9, 9, 9, 9, 9];
    else if (cv == 19) rbcs = [9];
    else if (cv == 20) rbcs = [3, 3, 3, 3, 3, 0, 0, 0, 0, 0];
    else if (cv == 21) rbcs = [3, 3, 3, 3, 3, 3, 3, 18, 18, 18, 18, 18, 18, 20, 19, 20, 19, 20, 19, 20, 18, 18, 18, 18,
      18, 18
    ];
    else if (cv == 22) rbcs = [5, 5, 5, 5, 5, 5, 5, 9, 9, 9, 9, 9, 9, 9, 13, 13, 13, 13, 13, 13, 13];
    else if (cv == 23) rbcs = [16, 16, 16, 16, 16, 16, 16, 18, 18, 18, 18, 18, 18, 18, 7, 7, 7, 7, 7, 7, 7];
    else if (cv == 24) rbcs = [23, 23, 23, 23, 23, 23, 23, 23, 23, 18, 18, 18, 18, 18, 18, 18, 18, 18];
    else if (cv == 25) rbcs = [21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22];
    else if (cv == 26) rbcs = [24];
    else if (cv == 27) rbcs = [25];
    else if (cv == 28) rbcs = [18, 18, 18, 18, 18, 18, 18, 25, 25,
      25, 25, 25, 25, 25, 7, 7, 7, 7, 7, 7, 7
    ];
    else if (cv == 29) rbcs = [11, 11, 4, 11, 11, 11, 11, 4, 11, 11];
    else if (cv == 30) rbcs = [10, 10, 19, 20, 10, 10, 20, 19];
    else if (cv == 31) rbcs = [10, 10];
    else if (cv == 32) rbcs = [20, 20];
    else if (cv == 33) rbcs = [12, 11, 11];
    else if (cv == 34) rbcs = [7, 7, 9, 13, 13, 9, 16, 16, 9, 12, 12, 9, 7, 7, 9, 16, 16, 9];
    else if (cv == 35) rbcs = [7, 7, 9, 9, 6, 6, 9, 9];
    else if (cv == 36) rbcs = [16, 16, 9, 9, 15, 15, 9, 9];
    else if (cv == 37) rbcs = [22];
    else if (cv == 38) rbcs = [18];
    else if (cv == 39) rbcs = [23];
    else if (cv == 40) rbcs = [26];
    else if (cv == 41) rbcs = [27];
    else if (cv == 42) rbcs = [2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 5, 5, 5, 5, 5, 5, 5, 5, 7, 7, 7, 7, 7, 7,
      7, 7
    ];
    else if (cv == 43) rbcs = [28];
    else if (cv == 44) rbcs = [29];
    else if (cv == 45) rbcs = [7, 7, 7, 9, 9, 9, 9, 9, 9, 9, 9, 7, 7, 7];
    else if (cv == 46) rbcs = [7];
    else if (cv == 47) rbcs = [16, 16, 16, 18, 18, 18, 18, 18, 18, 18, 18, 18, 7, 7, 7, 7, 7, 7, 7, 7, 16, 16, 16, 16];
    else if (cv == 48) rbcs = [7];
    else if (cv == 49) rbcs = [23, 23, 23, 23, 23, 9, 9, 9, 9, 9, 9, 9, 9, 23, 23];
    else if (cv == 50) rbcs = [18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 16, 16, 16, 16, 16, 16, 16, 16,
      7, 7, 7, 7, 7, 7, 7, 7
    ];
    else if (cv == 51) rbcs = [7, 7, 7, 9, 9, 16, 16, 16,
      16, 16, 16, 9, 9
    ];
    else if (cv == 52) rbcs = [7, 7, 7, 7, 18, 18, 18, 18, 18, 18, 18, 18, 18, 7, 7, 7, 7, 7];
    else if (cv == 53) rbcs = [30];
    else if (cv == 54) rbcs = [31];
    else if (cv == 55) rbcs = [32];
    else if (cv == 56) rbcs = [33];
    else if (cv == 57) rbcs = [34];
    else if (cv == 58) rbcs = [35];
    else if (cv == 59) rbcs = [18];
    else if (cv == 60) {
      rbcs = [36];
      fdhc = 37;
      fdtc = 38;
      fdl = 30
    } else if (cv == 61) rbcs = [30, 30, 30, 30, 30, 30, 35, 35, 35, 35, 35, 35, 33, 33, 33, 33, 33, 33, 31, 31, 31, 31,
      31, 31, 32, 32, 32, 32, 32, 32, 34, 34, 34, 34, 34, 34
    ];
    else if (cv == 62) rbcs = [17, 17, 17, 17, 17, 39, 39, 39, 39, 39];
    else if (cv == 63) rbcs = [7, 7, 7, 11, 11, 11];
    else if (cv == 64) rbcs = [16, 16, 11, 11];
    else if (cv == 65) rbcs = [4, 4, 4, 4, 9, 9, 9, 9];
    else cv = cv % 9;
    if (useWebGL)
      if (!rbcs) rbcs = [cv];
    if (rbcs) cv = rbcs[0];
    o.rbcs = rbcs;
    o.cv = cv
  }
  o.fdhc = fdhc;
  o.fdtc = fdtc;
  o.fdl = fdl;
  if (useWebGL) {
    if (o.sglo) {
      var k = o.lsgvc;
      for (j = 0; j < k; j++) o.sgsv[j] = false
    } else {
      o.lsgvc = 0;
      var oso = null;
      if (playerSnake == null) {
        oso = ssdo;
        ssdo = null
      }
      if (oso == null) oso = slitherDeadpool.get();
      if (oso) {
        o.sgs = oso.sgs;
        o.shs = oso.shs;
        o.shs2 = oso.shs2;
        o.sfs = oso.sfs;
        o.sfus = oso.sfus;
        o.sds = oso.sds;
        o.sgsv = oso.sgsv;
        o.uglo = oso.uglo;
        o.eyelo =
          oso.eyelo;
        o.lefteye = oso.lefteye;
        o.leftpupil = oso.leftpupil;
        o.righteye = oso.righteye;
        o.rightpupil = oso.rightpupil;
        o.sglo = oso.sglo;
        o.shlo = oso.shlo;
        o.sflo = oso.sflo;
        o.sdlo = oso.sdlo;
        o.shlo.visible = true;
        o.sglo.visible = true;
        o.eyelo.visible = true
      } else {
        o.sgs = [];
        o.shs = [];
        o.shs2 = [];
        o.sfs = [];
        o.sfus = [];
        o.sgsv = [];
        o.sds = [];
        o.uglo = new PIXI.Container;
        o.shlo = new PIXI.Container;
        o.sglo = new PIXI.Container;
        o.eyelo = new PIXI.Container;
        o.sflo = new PIXI.Container;
        o.sdlo = new PIXI.Container;
        suglo.addChild(o.uglo);
        shilo.addChild(o.shlo);
        slilo.addChild(o.sglo);
        slilo.addChild(o.eyelo);
        sfilo.addChild(o.sflo);
        sdilo.addChild(o.sdlo);
        var lefteye = new PIXI.Sprite(eyeo.t);
        lefteye.anchor.set(.5);
        o.lefteye = lefteye;
        o.eyelo.addChild(lefteye);
        var righteye = new PIXI.Sprite(eyeo.t);
        righteye.anchor.set(.5);
        o.righteye = righteye;
        o.eyelo.addChild(righteye);
        var leftpupil = new PIXI.Sprite(pupilo.t);
        leftpupil.anchor.set(.5);
        o.leftpupil = leftpupil;
        o.eyelo.addChild(leftpupil);
        var rightpupil = new PIXI.Sprite(pupilo.t);
        rightpupil.anchor.set(.5);
        o.rightpupil = rightpupil;
        o.eyelo.addChild(rightpupil)
      }
      o.sflo.visible = false;
      o.uglo.visible = false;
      o.sdlo.visible = false
    }
    o.eyelo.visible = true;
    if (o.eac) {
      o.lefteye.visible = false;
      o.leftpupil.visible = false;
      o.righteye.visible = false;
      o.rightpupil.visible = false
    } else if (o.one_eye) {
      o.lefteye.visible = false;
      o.leftpupil.visible = false;
      o.righteye.visible = false;
      o.rightpupil.visible = false
    } else {
      o.lefteye.visible = true;
      o.lefteye.tint = o.ecv;
      o.leftpupil.visible = true;
      o.righteye.visible = true;
      o.righteye.tint = o.ecv;
      o.rightpupil.visible = true
    }
    if (o.jse) {
      o.ebi =
        new PIXI.Sprite(jsebo.t);
      o.ebi.anchor.set(.5);
      o.eyelo.addChild(o.ebi);
      o.epi = new PIXI.Sprite(jsepo.t);
      o.epi.anchor.set(.5);
      o.eyelo.addChild(o.epi)
    }
    if (o.slg) {
      o.stem1 = new PIXI.Sprite(sestt);
      o.stem1.anchor.set(.2666, .5);
      o.eyelo.addChildAt(o.stem1, 0);
      o.stem2 = new PIXI.Sprite(sestt);
      o.stem2.anchor.set(.2666, .5);
      o.eyelo.addChildAt(o.stem2, 0)
    }
    if (o.ppcv == 0) {
      o.leftpupil.texture = pupilo.t;
      o.rightpupil.texture = pupilo.t;
      o.leftpupil.tint = 16777215;
      o.rightpupil.tint = 16777215
    } else {
      o.leftpupil.texture = tpupilo.t;
      o.rightpupil.texture =
        tpupilo.t;
      o.leftpupil.tint = o.ppcv;
      o.rightpupil.tint = o.ppcv
    }
  }
}
var slitherDeadpool = createDeadpool();
var ssdo = null;
var foodDeadpool = createDeadpool();
var preyDeadpool = createDeadpool();
var nameDeadpool = createDeadpool();

function deleteSnakeAtIndex(index) {
  var o = allSnakes[index];
  allSnakes.splice(index, 1);
  if (useWebGL) {
    o.lsgvc = 0;
    o.sgsv = [];
    o.uglo.destroy({
      children: true
    });
    o.shlo.destroy({
      children: true
    });
    o.sglo.destroy({
      children: true
    });
    o.sflo.destroy({
      children: true
    });
    o.sdlo.destroy({
      children: true
    });
    o.eyelo.destroy({
      children: true
    });
    if (o.nko) o.nko.destroy({
      children: true
    });
    suglo.removeChild(o.uglo);
    shilo.removeChild(o.shlo);
    slilo.removeChild(o.sglo);
    slilo.removeChild(o.eyelo);
    sfilo.removeChild(o.sflo);
    sdilo.removeChild(o.sdlo)
  }
  return;
  if (useWebGL) {
    o.uglo.visible = false;
    o.sglo.visible = false;
    o.eyelo.visible = false;
    o.shlo.visible = false;
    o.sflo.visible = false;
    o.sdlo.visible = false;
    for (var i = o.sgs.length - 1; i >= 0; i--) {
      o.sgs[i].visible = false;
      o.shs[i].visible = false;
      o.shs2[i].visible = false;
      o.sfs[i].visible = false;
      o.sfus[i].visible = false;
      o.sds[i].visible = false;
      o.sgsv[i] = false
    }
    if (o.nko) {
      o.nko.visible = false;
      nameDeadpool.add(o.nko)
    }
    if (o.jse) {
      o.ebi.destroy({
        children: true
      });
      o.epi.destroy({
        children: true
      })
    }
    if (o.slg) {
      o.stem1.destroy({
        children: true
      });
      o.stem2.destroy({
        children: true
      })
    }
  }
  if (o ==
    playerSnake && ssdo == null) ssdo = o;
  else slitherDeadpool.add(o)
}

function deleteFood(fo) {
  fo.fi.visible = false;
  fo.ofi.visible = false;
  fo.gfi.visible = false;
  fo.g2fi.visible = false;
  foodDeadpool.add(fo)
}

function deletePrey(prey) {
  prey.pri.visible = false;
  prey.gpri.visible = false;
  preyDeadpool.add(prey)
}

function addOrGetGpuPoint(o, q, xx, yy) {
  if (q < o.gpuPoints.length) {
    var gpo = o.gpuPoints[q];
    gpo.segmentX = xx;
    gpo.segmentY = yy;
    return gpo
  } else {
    gpo = {};
    gpo.segmentX = xx;
    gpo.segmentY = yy;
    o.gpuPoints.push(gpo);
    return gpo
  }
}

function createSnake(id, xx, yy, cv, ang, pts, msl, custom_skin_uint8) {
  var o = {};
  o.id = id;
  o.headX = xx;
  o.headY = yy;
  applySkin(o, cv, custom_skin_uint8);
  cv = o.cv;
  o.fnframeCounter = 0;
  o.na = 1;
  o.chainLength = 0;
  o.targetSpeed = 0;
  o.smoothFrame = 0;
  o.gpuPoints = [];
  o.accessory = -1;
  o.kill_count = 0;
  o.rr = Math.min(255, rrs[cv] + Math.floor(Math.random() * 20));
  o.gg = Math.min(255, ggs[cv] + Math.floor(Math.random() * 20));
  o.bb = Math.min(255, bbs[cv] + Math.floor(Math.random() * 20));
  var rs = "00" + Math.min(255, Math.max(0, Math.round(o.rr))).toString(16);
  var gs = "00" + Math.min(255, Math.max(0, Math.round(o.gg))).toString(16);
  var bs = "00" + Math.min(255, Math.max(0, Math.round(o.bb))).toString(16);
  rs = rs.substr(rs.length - 2);
  gs = gs.substr(gs.length - 2);
  bs = bs.substr(bs.length - 2);
  o.cs = "#" + rs + gs + bs;
  var v = .4;
  rs = "00" + Math.min(255, Math.max(0, Math.round(o.rr * v))).toString(16);
  gs = "00" + Math.min(255, Math.max(0, Math.round(o.gg * v))).toString(16);
  bs = "00" + Math.min(255, Math.max(0, Math.round(o.bb * v))).toString(16);
  rs = rs.substr(rs.length - 2);
  gs = gs.substr(gs.length - 2);
  bs = bs.substr(bs.length - 2);
  o.cs04 = "#" + rs + gs + bs;
  var v = 1.5;
  rs = "00" + Math.min(255, Math.max(0,
    Math.round((255 + o.rr) * .5))).toString(16);
  gs = "00" + Math.min(255, Math.max(0, Math.round((255 + o.gg) * .5))).toString(16);
  bs = "00" + Math.min(255, Math.max(0, Math.round((255 + o.bb) * .5))).toString(16);
  rs = rs.substr(rs.length - 2);
  gs = gs.substr(gs.length - 2);
  bs = bs.substr(bs.length - 2);
  o.csw = "#" + rs + gs + bs;
  o.scale = 1;
  o.ssp = baseSpeed + speedPerScale * o.scale;
  o.fsp = o.ssp + .1;
  o.msp = boostSpeed;
  o.interpOffsetXs = new Float32Array(rightFrameCount);
  o.interpOffsetYs = new Float32Array(rightFrameCount);
  o.interpLengths = new Float32Array(rightFrameCount);
  o.fpos = 0;
  o.ftg = 0;
  o.interpOffsetX = 0;
  o.interpOffsetY = 0;
  o.interpLength = 0;
  o.interpAngles = new Float32Array(angleFrameCount);
  o.interpAnglepos = 0;
  o.interpAngletg = 0;
  o.interpAngle = 0;
  o.eyeAngle = ang;
  o.targetEyeAngle = ang;
  o.eyeLength = 1;
  o.segmentLength = msl;
  o.fractionalLength = 0;
  o.rsc = 0;
  o.currentAngle = ang;
  o.targetAngle = ang;
  o.serverAngle = ang;
  o.rex = 0;
  o.rey = 0;
  o.speed = 2;
  if (pts) {
    o.bodyPoints = pts;
    o.segmentCount = pts.length;
    if (pts[0].dying) o.segmentCount--
  } else {
    o.bodyPoints = [];
    o.segmentCount = 0
  }
  o.flpos = 0;
  o.fls = new Float32Array(leftFrameCount);
  o.fl = 0;
  o.fltg = 0;
  o.tl = o.segmentCount + o.fractionalLength;
  if (render_mode == 1) o.cfl = o.tl;
  else o.cfl = o.tl - .6;
  o.scalealeAngleFactor = 1;
  o.isDead_amt = 0;
  o.alive_amt = 0;
  if (team_mode && playerSnake && cv == playerSnake.cv) allSnakes.push(o);
  else allSnakes.splice(0, 0, o);
  os["s" + o.id] = o;
  return o
}

function getBuildSkinData(pad) {
  var fa = [];
  fa.push(255);
  fa.push(255);
  fa.push(255);
  fa.push(0);
  fa.push(0);
  fa.push(0);
  fa.push(Math.floor(Math.random() * 256));
  fa.push(Math.floor(Math.random() * 256));
  var i;
  var j;
  j = buildSegments.length;
  if (j > 0) {
    var s;
    var ls = buildSegments[0];
    var c = 0;
    for (i = 0; i < j; i++) {
      s = buildSegments[i];
      if (s != ls) {
        if (c > 255) c = 255;
        fa.push(c);
        fa.push(ls);
        c = 0;
        ls = s
      }
      c++
    }
    if (c > 0) {
      fa.push(c);
      fa.push(ls)
    }
  }
  if (pad) {
    fa.push(250);
    fa.push(40)
  }
  var ffa = new Uint8Array(fa.length);
  for (i = 0; i < fa.length; i++) ffa[i] =
    fa[i];
  return ffa
}

function snakeLength(o) {
  var orl = o.tl;
  o.tl = o.segmentCount + Math.min(1, o.fractionalLength);
  var d = o.tl - orl;
  var k = o.flpos;
  for (var j = 0; j < leftFrameCount; j++) {
    o.fls[k] -= d * leftInterpFactors[j];
    k++;
    if (k >= leftFrameCount) k = 0
  }
  o.fl = o.fls[o.flpos];
  o.fltg = leftFrameCount;
  if (o == playerSnake) wantUpdateLeaderboard = true
}

function createFood(id, xx, yy, rad, rapid, cv) {
  var fo = {};
  fo.id = id;
  fo.foodX = xx;
  fo.foodY = yy;
  fo.foodRenderX = xx;
  fo.foodRenderY = yy;
  if (rapid) fo.rsp = 3;
  else fo.rsp = 1;
  if (cv > 9) cv %= 9;
  fo.cv = cv;
  fo.foodRadius = 1E-5;
  fo.foodSize = rad;
  fo.lrrad = fo.foodRadius;
  var pci = per_color_imgs[fo.cv];
  fo.cv2 = Math.floor(pci.ic * gameScale * fo.foodSize / 16.5);
  if (fo.cv2 < 0) fo.cv2 = 0;
  if (fo.cv2 >= pci.ic) fo.cv2 = pci.ic - 1;
  if (useWebGL) {
    var ofo = foodDeadpool.get();
    if (ofo) {
      fo.fi = ofo.fi;
      fo.ofi = ofo.ofi;
      fo.gfi = ofo.gfi;
      fo.g2fi = ofo.g2fi;
      fo.fi.texture = pci.wfdo.t;
      fo.ofi.texture = pci.wodo.t;
      fo.gfi.texture = pci.wgdo.t;
      fo.g2fi.texture =
        pci.wgdo.t;
      fo.fi.visible = false;
      fo.ofi.visible = false;
      fo.gfi.visible = false;
      fo.g2fi.visible = false
    } else {
      var ofi = new PIXI.Sprite(pci.wodo.t);
      ofi.anchor.set(.5);
      ofi.visible = false;
      fo.ofi = ofi;
      fdlo.addChild(ofi);
      var fi = new PIXI.Sprite(pci.wfdo.t);
      fi.blendMode = PIXI.BLEND_MODES.ADD;
      fi.anchor.set(.5);
      fi.visible = false;
      fo.fi = fi;
      fdglo.addChild(fi);
      var gfi = new PIXI.Sprite(pci.wgdo.t);
      gfi.blendMode = PIXI.BLEND_MODES.ADD;
      gfi.anchor.set(.5);
      gfi.visible = false;
      fo.gfi = gfi;
      fdglo.addChild(gfi);
      var g2fi = new PIXI.Sprite(pci.wgdo.t);
      g2fi.blendMode = PIXI.BLEND_MODES.ADD;
      g2fi.anchor.set(.5);
      g2fi.visible = false;
      fo.g2fi = g2fi;
      g2lo.addChild(g2fi)
    }
  } else {
    fo.fi = pci.imgs[fo.cv2];
    fo.fw = pci.fwebSocket[fo.cv2];
    fo.fh = pci.fhs[fo.cv2];
    fo.fw2 = pci.fw2s[fo.cv2];
    fo.fh2 = pci.fh2s[fo.cv2];
    fo.ofi = pci.oimgs[fo.cv2];
    fo.ofw = pci.ofwebSocket[fo.cv2];
    fo.ofh = pci.ofhs[fo.cv2];
    fo.ofw2 = pci.ofw2s[fo.cv2];
    fo.ofh2 = pci.ofh2s[fo.cv2];
    fo.gcv = Math.floor(pci.ic * gameScale * (.25 + .75 * fo.foodSize / 16.5));
    if (fo.gcv < 0) fo.gcv = 0;
    if (fo.gcv >= pci.ic) fo.gcv = pci.ic - 1;
    fo.gfi = pci.gimgs[fo.gcv];
    fo.gfw = pci.gfwebSocket[fo.gcv];
    fo.gfh = pci.gfhs[fo.gcv];
    fo.gfw2 = pci.gfw2s[fo.gcv];
    fo.gfh2 = pci.gfh2s[fo.gcv];
    fo.g2cv = Math.floor(pci.ic * gameScale * 2 * (.25 + .75 * fo.foodSize / 16.5));
    if (fo.g2cv < 0) fo.g2cv = 0;
    if (fo.g2cv >= pci.ic) fo.g2cv = pci.ic - 1;
    fo.g2fi = pci.gimgs[fo.g2cv];
    fo.g2fw = pci.gfwebSocket[fo.g2cv];
    fo.g2fh = pci.gfhs[fo.g2cv];
    fo.g2fw2 = pci.gfw2s[fo.g2cv];
    fo.g2fh2 = pci.gfh2s[fo.g2cv]
  }
  fo.frameCounter = 0;
  fo.gframeCounter = Math.random() * 64;
  fo.gr = .65 + .1 * fo.foodSize;
  fo.wsp = (2 * Math.random() - 1) * .0225;
  fo.foodEatenFrame = 0;
  allFoods[foodsCount++] = fo;
  return fo
}

function createPrey(id, xx, yy, rad, cv, dir, wang, ang, speed) {
  var prey = {};
  prey.id = id;
  prey.xx = xx;
  prey.yy = yy;
  prey.rad = 1E-5;
  prey.sz = rad;
  prey.cv = cv % 9;
  prey.dir = dir;
  prey.wang = wang;
  prey.ang = ang;
  prey.sp = speed;
  prey.frameCounter = 0;
  prey.gframeCounter = Math.random() * 64;
  prey.gr = .5 + Math.random() * .15 + .1 * prey.sz;
  prey.rr = Math.min(255, rrs[cv]);
  prey.gg = Math.min(255, ggs[cv]);
  prey.bb = Math.min(255, bbs[cv]);
  var rs = "00" + Math.min(255, Math.max(0, Math.round(prey.rr))).toString(16);
  var gs = "00" + Math.min(255, Math.max(0, Math.round(prey.gg))).toString(16);
  var bs = "00" + Math.min(255, Math.max(0, Math.round(prey.bb))).toString(16);
  rs = rs.substr(rs.length - 2);
  gs = gs.substr(gs.length - 2);
  bs = bs.substr(bs.length - 2);
  var pci = per_color_imgs[prey.cv];
  prey.cs = "#" + rs + gs + bs;
  if (!useWebGL) {
    prey.cv2 = Math.floor(pci.pr_imgs.length * gameScale * prey.sz / 9);
    if (prey.cv2 < 0) prey.cv2 = 0;
    if (prey.cv2 >= pci.pr_imgs.length) prey.cv2 = pci.pr_imgs.length - 1
  }
  if (useWebGL) {
    var pri;
    var gpri;
    var oprey = preyDeadpool.get();
    if (oprey) {
      pri = oprey.pri;
      prey.pri = pri;
      pri.texture = pci.pro.t;
      gpri = oprey.gpri;
      prey.gpri = gpri;
      gpri.texture = pci.gpro.t
    } else {
      pri = new PIXI.Sprite(pci.pro.t);
      pri.blendMode = PIXI.BLEND_MODES.ADD;
      pri.anchor.set(.5);
      prey.pri = pri;
      prlo.addChild(pri);
      gpri = new PIXI.Sprite(pci.gpro.t);
      gpri.blendMode = PIXI.BLEND_MODES.ADD;
      gpri.anchor.set(.5);
      prey.gpri = gpri;
      prglo.addChild(gpri)
    }
    pri.visible = true;
    gpri.visible = true
  } else {
    prey.fi = pci.pr_imgs[prey.cv2];
    prey.fw = pci.pr_fwebSocket[prey.cv2];
    prey.fh = pci.pr_fhs[prey.cv2];
    prey.fw2 = pci.pr_fw2s[prey.cv2];
    prey.fh2 = pci.pr_fh2s[prey.cv2];
    prey.gcv = pci.gimgs.length - 1;
    prey.gfi = pci.gimgs[prey.gcv];
    prey.gfw = pci.gfwebSocket[prey.gcv];
    prey.gfh = pci.gfhs[prey.gcv];
    prey.gfw2 = pci.gfw2s[prey.gcv];
    prey.gfh2 = pci.gfh2s[prey.gcv]
  }
  prey.fxs = new Float32Array(rightFrameCount);
  prey.fys = new Float32Array(rightFrameCount);
  prey.fpos = 0;
  prey.ftg = 0;
  prey.fx = 0;
  prey.fy = 0;
  prey.eaten = false;
  prey.eaten_frameCounter = 0;
  allPreys.push(prey);
  return prey
}
var ecmainCanvas = document.createElement("canvas");
ecmainCanvas.width = ecmainCanvas.height = 48;
var ctx = ecmainCanvas.getContext("2d");
ctx.fillStyle = "#000000";
ctx.moveTo(36, 6);
ctx.lineTo(30, 6);
ctx.quadraticCurveTo(0, 24, 30, 48 - 6);
ctx.lineTo(36, 48 - 6);
ctx.quadraticCurveTo(14, 24, 36, 6);
ctx.fill();
var kdo;
if (useWebGL) {
  var kdmainCanvas = document.createElement("canvas");
  kdmainCanvas.width = kdmainCanvas.height = 64;
  var ctx = kdmainCanvas.getContext("2d");
  ctx.fillStyle = "#FF7755";
  ctx.arc(32, 32, 32, 0, TWO_PI);
  ctx.fill();
  kdo = {};
  kdo.cc = kdmainCanvas;
  kdo.sheet = 0;
  textures.push(kdo)
} else {
  var kdmainCanvas = document.createElement("canvas");
  kdmainCanvas.width = kdmainCanvas.height = 32;
  var ctx = kdmainCanvas.getContext("2d");
  ctx.fillStyle = "#FF9966";
  ctx.arc(16, 16, 16, 0, TWO_PI);
  ctx.fill()
}
var sz = 52;
var komainCanvas = document.createElement("canvas");
komainCanvas.width = komainCanvas.height = sz;
var ctx = komainCanvas.getContext("2d");
var map = ctx.getImageData(0, 0, sz, sz);
var imgd = map.data;
var l = imgd.length;
var p;
var xx = 0;
var yy = 0;
for (p = 0; p < l; p += 4) {
  var v = Math.abs(Math.sqrt(Math.pow(sz / 2 - xx, 2) + Math.pow(sz / 2 - yy, 2)) - 16);
  if (v <= 4) v = 1 - v / 4;
  else v = 0;
  v *= .8;
  imgd[p] = imgd[p + 1] = imgd[p + 2] = 0;
  imgd[p + 3] = Math.floor(255 * v);
  xx++;
  if (xx >= sz) {
    xx = 0;
    yy++
  }
}
ctx.putImageData(map, 0, 0);
if (iioc && testing) {
  var u = komainCanvas.toDataURL();
  var ii = document.createElement("img");
  ii.src = u;
  komainCanvas = ii
}
sz = 62;
var ksmainCanvas = document.createElement("canvas");
ksmainCanvas.width = ksmainCanvas.height = sz;
var ctx = ksmainCanvas.getContext("2d");
var map = ctx.getImageData(0, 0, sz, sz);
var imgd = map.data;
var l = imgd.length;
var p;
var xx = 0;
var yy = 0;
for (p = 0; p < l; p += 4) {
  var v = Math.sqrt(Math.pow(sz / 2 - xx, 2) + Math.pow(sz / 2 + 3 - yy, 2)) - 15;
  v *= .1;
  if (v < 0) v = -v;
  if (v > 1) v = 1;
  v = 1 - v;
  v *= .25;
  imgd[p] = imgd[p + 1] = imgd[p + 2] = 0;
  imgd[p + 3] = Math.floor(255 * v);
  xx++;
  if (xx >= sz) {
    xx = 0;
    yy++
  }
}
ctx.putImageData(map, 0, 0);
if (iioc && testing) {
  var u = ksmainCanvas.toDataURL();
  var ii = document.createElement("img");
  ii.src = u;
  ksmainCanvas = ii
}
var kst;
var kso;
var koso;
if (useWebGL) {
  kso = {};
  kso.cc = ksmainCanvas;
  kso.sheet = 0;
  textures.push(kso)
}
var sz = 64;
var jsebi = document.createElement("canvas");
jsebi.width = jsebi.height = sz;
var ctx = jsebi.getContext("2d");
ctx.fillStyle = "#ffffff";
ctx.beginPath();
ctx.arc(sz / 2, sz / 2, sz / 2, 0, TWO_PI);
ctx.fill();
var map = ctx.getImageData(0, 0, sz, sz);
var imgd = map.data;
var l = imgd.length;
var p;
var xx = 0;
var yy = 0;
for (p = 0; p < l; p += 4) {
  var v = Math.abs(sz / 2 - Math.sqrt(Math.pow(sz / 2 - xx, 2) + Math.pow(sz / 2 - yy, 2))) / (sz / 2);
  v = v * 1.06 - .06;
  if (v < 0) v = 0;
  else {
    v = Math.pow(v, .35);
    v *= 1.35
  }
  v += (1 - v) * .25;
  imgd[p] = Math.max(0, Math.min(255, Math.round(72 * v)));
  imgd[p + 1] = Math.max(0, Math.min(255, Math.round(255 * v)));
  imgd[p + 2] = Math.max(0, Math.min(255, Math.round(116 * v)));
  xx++;
  if (xx >= sz) {
    xx = 0;
    yy++
  }
  v = sz / 2 - Math.sqrt(Math.pow(sz / 2 - xx, 2) + Math.pow(sz / 2 - yy, 2));
  if (v <= 3) imgd[p + 3] = Math.max(0, Math.min(255, Math.round(v / 3 * 255)));
  else imgd[p + 3] = 255
}
ctx.putImageData(map, 0, 0);
var jsebt;
var jsebo;
if (useWebGL) {
  jsebo = {};
  jsebo.cc = jsebi;
  jsebo.sheet = 0;
  textures.push(jsebo)
}
var sz = 48;
var jsepi = document.createElement("canvas");
jsepi.width = jsepi.height = sz;
var ctx = jsepi.getContext("2d");
ctx.fillStyle = "#ffffff";
ctx.beginPath();
ctx.arc(sz / 2, sz / 2, sz / 2, 0, TWO_PI);
ctx.fill();
var map = ctx.getImageData(0, 0, sz, sz);
var imgd = map.data;
var l = imgd.length;
var p;
var xx = 0;
var yy = 0;
for (p = 0; p < l; p += 4) {
  var v = Math.abs(sz / 2 - Math.sqrt(Math.pow(sz / 2 - xx, 2) + Math.pow(sz / 2 - yy, 2))) / (sz / 2);
  if (v > .5) v = 0;
  else v = 1 - Math.pow(v / .5, 1);
  v *= .8;
  if (v == 0) {
    imgd[p] = 0;
    imgd[p + 1] = 0;
    imgd[p + 2] = 0
  } else {
    imgd[p] = Math.max(0, Math.min(255, Math.round(28 + (87 - 28) * v)));
    imgd[p + 1] = Math.max(0, Math.min(255, Math.round(83 + (168 - 83) * v)));
    imgd[p + 2] = Math.max(0, Math.min(255, Math.round(128 + (238 - 128) * v)))
  }
  xx++;
  if (xx >= sz) {
    xx = 0;
    yy++
  }
}
ctx.putImageData(map, 0, 0);
var jsept;
var jsepo;
if (useWebGL) {
  jsepo = {};
  jsepo.cc = jsepi;
  jsepo.sheet = 0;
  textures.push(jsepo)
}
var rabulb = document.createElement("canvas");
rabulb.width = rabulb.height = 64;
var ctx = rabulb.getContext("2d");
var g = ctx.createRadialGradient(32, 32, 1, 32, 32, 32 - 1);
g.addColorStop(0, "rgba(255, 255, 255, 1)");
g.addColorStop(.83, "rgba(150,150,150, 1)");
g.addColorStop(.84, "rgba(80,80,80, 1)");
g.addColorStop(.99, "rgba(80,80,80, 1)");
g.addColorStop(1, "rgba(80,80,80, 0)");
ctx.fillStyle = g;
ctx.fillRect(0, 0, 64, 64);
var cdbulb = document.createElement("canvas");
cdbulb.width = 84;
cdbulb.height = 84;
var cdbulb2 = document.createElement("canvas");
cdbulb2.width = 84;
cdbulb2.height = 84;
var ctx = cdbulb2.getContext("2d");
ctx.fillStyle = "#ff5609";
ctx.fillRect(13, 10, 58 / 2, 64);
ctx.fillRect(13, 10, 58, 22);
ctx.fillRect(13, 10 + 44, 58, 22);
var ctx = cdbulb.getContext("2d");
ctx.shadowColor = "#000000";
ctx.shadowBlur = 20;
ctx.drawImage(cdbulb2, 0, 0);
ctx.drawImage(cdbulb2, 0, 0);
var acbulb = document.createElement("canvas");
acbulb.width = acbulb.height = 64;
var ctx = acbulb.getContext("2d");
var g = ctx.createRadialGradient(32, 32, 1, 32, 32, 32 - 1);
g.addColorStop(0, "rgba(255, 128, 128, 1)");
g.addColorStop(.5, "rgba(222, 3, 3, 1)");
g.addColorStop(.96, "rgba(157, 18, 18, 1)");
g.addColorStop(1, "rgba(0,0,0, 0)");
ctx.fillStyle = g;
ctx.fillRect(0, 0, 64, 64);
var kwkbulb = document.createElement("canvas");
kwkbulb.width = 130 + 42;
kwkbulb.height = 71 + 42;
var kwki = document.createElement("img");
kwki.onload = function() {
  var tmainCanvas = document.createElement("canvas");
  tmainCanvas.width = 130 + 42;
  tmainCanvas.height = 71 + 42;
  var ctx = tmainCanvas.getContext("2d");
  ctx.drawImage(kwki, 21, 21);
  var ctx = kwkbulb.getContext("2d");
  ctx.shadowColor = "#000000";
  ctx.shadowBlur = 20;
  ctx.drawImage(tmainCanvas, 0, 0)
};
kwki.src = "http://slither.io/s/kwk6.png";
var jmou = document.createElement("canvas");
jmou.width = 79;
jmou.height = 130;
var jmoi = document.createElement("img");
jmoi.onload = function() {
  var ctx = jmou.getContext("2d");
  ctx.drawImage(jmoi, 0, 0)
};
jmoi.src = "http://slither.io/s/jmou3.png";
var pwdbulb = document.createElement("canvas");
pwdbulb.width = 148 + 42;
pwdbulb.height = 146 + 42;
var pwdi = document.createElement("img");
pwdi.onload = function() {
  var tmainCanvas = document.createElement("canvas");
  tmainCanvas.width = 148 + 42;
  tmainCanvas.height = 146 + 42;
  var ctx = tmainCanvas.getContext("2d");
  ctx.drawImage(pwdi, 21, 21);
  var ctx = pwdbulb.getContext("2d");
  ctx.shadowColor = "#000000";
  ctx.shadowBlur = 20;
  ctx.drawImage(tmainCanvas, 0, 0)
};
pwdi.src = "http://slither.io/s/pewd.png";
var sestt;
if (!useWebGL) {
  var sest = document.createElement("canvas");
  sest.width = 105;
  sest.height = 88;
  var sesti = document.createElement("img");
  sesti.onload = function() {
    var ctx = sest.getContext("2d");
    ctx.drawImage(sesti, 0, 0)
  };
  sesti.src = "https://slither.io/s2/sest5.png"
}
if (useWebGL)(async () => {
  sestt = await PIXI.Assets.load("https://slither.io/s2/sest5.png")
})();
var playbulb = document.createElement("canvas");
playbulb.width = 100 + 42;
playbulb.height = 107 + 42;
var plyi = document.createElement("img");
plyi.onload = function() {
  var tmainCanvas = document.createElement("canvas");
  tmainCanvas.width = 100 + 42;
  tmainCanvas.height = 107 + 42;
  var ctx = tmainCanvas.getContext("2d");
  ctx.drawImage(plyi, 21, 21);
  var ctx = playbulb.getContext("2d");
  ctx.shadowColor = "#000000";
  ctx.shadowBlur = 20;
  ctx.drawImage(tmainCanvas, 0, 0)
};
plyi.src = "http://slither.io/s/play.png";
var bonkbulb = document.createElement("canvas");
bonkbulb.width = 131 + 42;
bonkbulb.height = 136 + 42;
var bnki = document.createElement("img");
bnki.onload = function() {
  var tmainCanvas = document.createElement("canvas");
  tmainCanvas.width = 131 + 42;
  tmainCanvas.height = 136 + 42;
  var ctx = tmainCanvas.getContext("2d");
  ctx.drawImage(bnki, 21, 21);
  var ctx = bonkbulb.getContext("2d");
  ctx.shadowColor = "#000000";
  ctx.shadowBlur = 20;
  ctx.drawImage(tmainCanvas, 0, 0)
};
bnki.src = "http://slither.io/s/bonkers2.png";
var leafbulb = document.createElement("canvas");
leafbulb.width = 101 + 42;
leafbulb.height = 119 + 42;
var leafi = document.createElement("img");
leafi.onload = function() {
  var tmainCanvas = document.createElement("canvas");
  tmainCanvas.width = 101 + 42;
  tmainCanvas.height = 119 + 42;
  var ctx = tmainCanvas.getContext("2d");
  ctx.drawImage(leafi, 21, 21);
  var ctx = leafbulb.getContext("2d");
  ctx.shadowColor = "#000000";
  ctx.shadowBlur = 20;
  ctx.drawImage(tmainCanvas, 0, 0)
};
leafi.src = "http://slither.io/s/leaf.png";
var swissbulb = document.createElement("canvas");
swissbulb.width = 98 + 42;
swissbulb.height = 98 + 42;
var swissi = document.createElement("img");
swissi.onload = function() {
  var tmainCanvas = document.createElement("canvas");
  tmainCanvas.width = 98 + 42;
  tmainCanvas.height = 98 + 42;
  var ctx = tmainCanvas.getContext("2d");
  ctx.drawImage(swissi, 21, 21);
  var ctx = swissbulb.getContext("2d");
  ctx.shadowColor = "#000000";
  ctx.shadowBlur = 20;
  ctx.drawImage(tmainCanvas, 0, 0)
};
swissi.src = "http://slither.io/s/swiss.png";
var moldovabulb = document.createElement("canvas");
moldovabulb.width = 120 + 42;
moldovabulb.height = 95 + 42;
var moldovai = document.createElement("img");
moldovai.onload = function() {
  var tmainCanvas = document.createElement("canvas");
  tmainCanvas.width = 120 + 42;
  tmainCanvas.height = 95 + 42;
  var ctx = tmainCanvas.getContext("2d");
  ctx.drawImage(moldovai, 21, 21);
  var ctx = moldovabulb.getContext("2d");
  ctx.shadowColor = "#000000";
  ctx.shadowBlur = 20;
  ctx.drawImage(tmainCanvas, 0, 0)
};
moldovai.src = "http://slither.io/s/moldova.png";
var vietnambulb = document.createElement("canvas");
vietnambulb.width = 95 + 42;
vietnambulb.height = 100 + 42;
var vietnami = document.createElement("img");
vietnami.onload = function() {
  var tmainCanvas = document.createElement("canvas");
  tmainCanvas.width = 95 + 42;
  tmainCanvas.height = 100 + 42;
  var ctx = tmainCanvas.getContext("2d");
  ctx.drawImage(vietnami, 21, 21);
  var ctx = vietnambulb.getContext("2d");
  ctx.shadowColor = "#000000";
  ctx.shadowBlur = 20;
  ctx.drawImage(tmainCanvas, 0, 0)
};
vietnami.src = "http://slither.io/s/vietnam.png";
var argentinabulb = document.createElement("canvas");
argentinabulb.width = 110 + 42;
argentinabulb.height = 110 + 42;
var argentinai = document.createElement("img");
argentinai.onload = function() {
  var tmainCanvas = document.createElement("canvas");
  tmainCanvas.width = 110 + 42;
  tmainCanvas.height = 110 + 42;
  var ctx = tmainCanvas.getContext("2d");
  ctx.drawImage(argentinai, 21, 21);
  var ctx = argentinabulb.getContext("2d");
  ctx.shadowColor = "#000000";
  ctx.shadowBlur = 20;
  ctx.drawImage(tmainCanvas, 0, 0)
};
argentinai.src = "http://slither.io/s/argentina.png";
var movbulb = document.createElement("canvas");
movbulb.width = 100 + 42;
movbulb.height = 121 + 42;
var movi = document.createElement("img");
movi.onload = function() {
  var tmainCanvas = document.createElement("canvas");
  tmainCanvas.width = 100 + 42;
  tmainCanvas.height = 121 + 42;
  var ctx = tmainCanvas.getContext("2d");
  ctx.drawImage(movi, 21, 21);
  var ctx = movbulb.getContext("2d");
  ctx.shadowColor = "#000000";
  ctx.shadowBlur = 20;
  ctx.drawImage(tmainCanvas, 0, 0)
};
movi.src = "http://slither.io/s/mov2.png";
var colc;
if (testing) {
  colc = document.createElement("canvas");
  colc.width = 256;
  colc.height = 106;
  colc.style.position = "fixed";
  colc.style.left = "0px";
  colc.style.top = "100px";
  colc.style.zIndex = 2147483647;
  document.body.appendChild(colc)
}
var pbx = new Float32Array(32767);
var pby = new Float32Array(32767);
var pba = new Float32Array(32767);
var pbu = new Uint8Array(32767);
var per_color_imgs = [];
var rrs = [192, 144, 128, 128, 238, 255, 255, 255, 224, 255, 144, 80, 255, 40, 100, 120, 72, 160, 255, 56, 56, 78, 255,
  101, 128, 60, 0, 217, 255, 144, 32, 240, 240, 240, 240, 32, 40, 104, 0, 104, 0, 128
];
var ggs = [128, 153, 208, 255, 238, 160, 144, 64, 48, 255, 153, 80, 192, 136, 117, 134, 84, 80, 224, 68, 68, 35, 86,
  200, 132, 192, 255, 69, 64, 144, 32, 32, 240, 144, 32, 240, 60, 128, 0, 40, 0, 128
];
var bbs = [255, 255, 208, 128, 112, 96, 144, 64, 224, 255, 255, 80, 80, 96, 255, 255, 255, 255, 64, 255, 255, 192, 9,
  232, 144, 72, 83, 69, 64, 144, 240, 32, 32, 32, 240, 32, 173, 255, 112, 170, 0, 255
];
var ccs = [];
var ccvs = [];
var max_skin_cv = 64;
for (var i = 0; i < rrs.length; i++) {
  var rs = "00" + rrs[i].toString(16);
  var gs = "00" + ggs[i].toString(16);
  var bs = "00" + bbs[i].toString(16);
  rs = rs.substr(rs.length - 2);
  gs = gs.substr(gs.length - 2);
  bs = bs.substr(bs.length - 2);
  ccs.push("#" + rs + gs + bs);
  ccvs.push(rrs[i] << 16 | ggs[i] << 8 | bbs[i])
}
var alcsc = new Uint8Array(256);
var ralcsc = new Uint8Array(256);
var falcsc = new Uint8Array(256);
var csks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
  29, 30, 31, 32, 33, 34, 35, 37, 39, 41
];
for (var i = 0; i <= 255; i++) {
  ralcsc[i] = 0;
  falcsc[i] = 0
}
for (var i = csks.length - 1; i >= 0; i--) {
  ralcsc[csks[i]] = 1;
  falcsc[csks[i]] = 1
}
falcsc[40] = 1;
alcsc = ralcsc;
var eyet;
var pupilt;
var tpupilt;
if (useWebGL) {
  var sz = 6 * 6 * 2;
  var cc = document.createElement("canvas");
  cc.width = cc.height = sz;
  var ctx = cc.getContext("2d");
  ctx.fillStyle = "#FFFFFF";
  ctx.arc(sz / 2, sz / 2, sz / 2, 0, TWO_PI);
  ctx.fill();
  eyeo = {};
  eyeo.cc = cc;
  eyeo.sheet = 0;
  textures.push(eyeo);
  var sz = 3.5 * 6 * 2;
  var cc = document.createElement("canvas");
  cc.width = cc.height = sz;
  var ctx = cc.getContext("2d");
  ctx.fillStyle = "#000000";
  ctx.arc(sz / 2, sz / 2, sz / 2, 0, TWO_PI);
  ctx.fill();
  pupilo = {};
  pupilo.cc = cc;
  pupilo.sheet = 0;
  textures.push(pupilo);
  var sz = 3.5 * 6 * 2;
  var cc = document.createElement("canvas");
  cc.width = cc.height = sz;
  var ctx = cc.getContext("2d");
  ctx.fillStyle = "#FFFFFF";
  ctx.arc(sz / 2, sz / 2, sz / 2, 0, TWO_PI);
  ctx.fill();
  tpupilo = {};
  tpupilo.cc = cc;
  tpupilo.sheet = 0;
  textures.push(tpupilo)
}
for (var i = 0; i < rrs.length; i++) {
  var o = {};
  o.imgs = [];
  o.fwebSocket = [];
  o.fhs = [];
  o.fw2s = [];
  o.fh2s = [];
  o.gimgs = [];
  o.gfwebSocket = [];
  o.gfhs = [];
  o.gfw2s = [];
  o.gfh2s = [];
  o.oimgs = [];
  o.ofwebSocket = [];
  o.ofhs = [];
  o.ofw2s = [];
  o.ofh2s = [];
  var rs = "00" + rrs[i].toString(16);
  var gs = "00" + ggs[i].toString(16);
  var bs = "00" + bbs[i].toString(16);
  rs = rs.substr(rs.length - 2);
  gs = gs.substr(gs.length - 2);
  bs = bs.substr(bs.length - 2);
  o.cs = "#" + rs + gs + bs;
  var sz = 62;
  var kfmainCanvas = document.createElement("canvas");
  kfmainCanvas.width = kfmainCanvas.height = sz;
  var ctx = kfmainCanvas.getContext("2d");
  var map =
    ctx.getImageData(0, 0, sz, sz);
  var imgd = map.data;
  var l = imgd.length;
  var p;
  var xx = 0;
  var yy = 0;
  var fi = i;
  if (i == 26) fi = 3;
  else if (i == 29) fi = 9;
  else if (i == 30) fi = 15;
  else if (i == 31) fi = 7;
  else if (i == 32) fi = 4;
  else if (i == 33) fi = 5;
  else if (i == 34) fi = 0;
  else if (i == 35) fi = 3;
  else if (i == 36) fi = 7;
  else if (i == 41) fi = 15;
  var rr = rrs[fi];
  var gg = ggs[fi];
  var bb = bbs[fi];
  var t1 = (rr + gg + bb) / 3;
  if (t1 <= 24) rr = gg = bb = 90;
  else {
    var t2 = 120 / t1;
    rr = Math.min(255, Math.floor(rr * t2));
    gg = Math.min(255, Math.floor(gg * t2));
    bb = Math.min(255, Math.floor(bb * t2))
  }
  for (p =
    0; p < l; p += 4) {
    var v = 1 - Math.sqrt(Math.pow(sz / 2 - xx, 2) + Math.pow(sz / 2 - yy, 2)) / 32;
    if (v < 0) v = 0;
    else v = .5 * (1 - Math.cos(Math.PI * v));
    imgd[p] = rr;
    imgd[p + 1] = gg;
    imgd[p + 2] = bb;
    imgd[p + 3] = Math.floor(255 * v);
    xx++;
    if (xx >= sz) {
      xx = 0;
      yy++
    }
  }
  ctx.putImageData(map, 0, 0);
  o.kfmainCanvas = kfmainCanvas;
  if (useWebGL) {
    var kfo = {};
    kfo.cc = kfmainCanvas;
    kfo.sheet = 0;
    textures.push(kfo);
    o.kfo = kfo
  }
  var ksz = 48;
  var ksz2 = ksz / 2;
  var kmainCanvas = document.createElement("canvas");
  kmainCanvas.width = kmainCanvas.height = ksz;
  var ctx = kmainCanvas.getContext("2d");
  ctx.fillStyle = "#FFFFFF";
  ctx.arc(ksz2, ksz2, ksz2, 0, TWO_PI);
  ctx.fill();
  var map = ctx.getImageData(0, 0, ksz, ksz);
  var imgd = map.data;
  var l = imgd.length;
  var p;
  var xx = 0;
  var yy = 0;
  var jk = 7;
  var rr, gg, bb;
  if (i == 36) jk = 60;
  var v3;
  var kmcs = [];
  var kmouseOverStates = [];
  for (var j = 0; j < jk; j++) {
    xx = yy = 0;
    for (p = 0; p < l; p += 4) {
      var v;
      var v2 = Math.max(0, Math.min(1, 1 - Math.sqrt(Math.pow(xx - ksz2, 2) + Math.pow(yy - ksz2, 2)) / 34));
      if (nsr) v = Math.pow(v2, .5);
      else {
        v = Math.pow(Math.max(0, Math.min(1, 1 - Math.abs(yy - ksz2) / ksz2)), .35);
        v += (v2 - v) * .375
      }
      rr = rrs[i];
      gg = ggs[i];
      bb = bbs[i];
      if (i == 24) {
        v2 = Math.sqrt(Math.pow(.5 * (xx - ksz2), 2) + Math.pow(1 *
          (yy - ksz2), 2)) / ksz2;
        v2 = Math.pow(v2 * 1.05, 4);
        if (v2 > 1) v2 = 1;
        rr += (255 * 1.2 - rr) * v2;
        gg += (192 * 1.2 - gg) * v2;
        bb += (64 * 1.2 - bb) * v2;
        v *= 1.22 - .44 * j / (jk - 1)
      } else if (i == 26) {
        v2 = Math.sqrt(Math.pow(.5 * (xx - ksz2), 2) + Math.pow(1 * (yy - ksz2), 2)) / ksz2;
        v2 = Math.pow(v2, 2);
        if (v2 > 1) v2 = 1;
        v *= 1.22 - .44 * j / (jk - 1);
        rr *= v;
        gg *= v;
        bb *= v;
        v = 1;
        rr += (128 * 1.1 - rr) * v2;
        gg += (255 * 1.1 - gg) * v2;
        bb += (136 * 1.1 - bb) * v2
      } else if (i == 27) {
        v2 = Math.sqrt(Math.pow(.5 * (xx - ksz2), 2) + Math.pow(1 * (yy - ksz2), 2)) / ksz2;
        v2 = Math.pow(v2, 2);
        if (v2 > 1) v2 = 1;
        v *= 1.22 - .44 * j / (jk - 1);
        rr *= v;
        gg *= v;
        bb *=
          v;
        v = 1;
        rr += (217 * 1.1 - rr) * v2;
        gg += (69 * 1.1 - gg) * v2;
        bb += (69 * 1.1 - bb) * v2
      } else if (i == 28) {
        v2 = .5 - .5 * Math.cos(Math.PI * j / jk);
        rr += (128 * 1 - rr) * v2;
        gg += (128 * 1 - gg) * v2;
        bb += (255 * 1 - bb) * v2;
        v *= 1.1;
        if (v > 1) v = 1
      } else if (i == 29) {
        v2 = Math.sqrt(Math.pow(.5 * (xx - ksz2), 2) + Math.pow(1 * (yy - ksz2), 2)) / ksz2;
        v2 = Math.pow(v2, 2);
        if (v2 > 1) v2 = 1;
        v *= 1.44 - .88 * j / (jk - 1);
        rr = v * 32;
        gg = v * 32;
        bb = v * 32;
        v = 1;
        rr += (255 * 1 - rr) * v2;
        gg += (255 * 1 - gg) * v2;
        bb += (255 * 1 - bb) * v2
      } else if (i == 30) {
        v2 = Math.sqrt(Math.pow(.5 * (xx - ksz2), 2) + Math.pow(1 * (yy - ksz2), 2)) / ksz2;
        v2 = Math.pow(v2, 2);
        if (v2 > 1) v2 = 1;
        v = (.1 + .9 * j / jk) % 1;
        rr = v * 80;
        gg = v * 80;
        bb = 128 + v * 160;
        rr += (255 * 1 - rr) * .3 * v2;
        gg += (255 * 1 - gg) * .3 * v2;
        bb += (255 * 1.4 - bb) * .3 * v2;
        v = 1
      } else if (i == 31) {
        v2 = Math.sqrt(Math.pow(.5 * (xx - ksz2), 2) + Math.pow(1 * (yy - ksz2), 2)) / ksz2;
        v2 = Math.pow(v2, 2);
        if (v2 > 1) v2 = 1;
        v = (.1 + .9 * j / jk) % 1;
        rr = 128 + v * 160;
        gg = v * 80;
        bb = v * 80;
        rr += (255 * 1.4 - rr) * .3 * v2;
        gg += (255 * 1 - gg) * .3 * v2;
        bb += (255 * 1 - bb) * .3 * v2;
        v = 1
      } else if (i == 32) {
        v2 = Math.sqrt(Math.pow(.5 * (xx - ksz2), 2) + Math.pow(1 * (yy - ksz2), 2)) / ksz2;
        v2 = Math.pow(v2, 2);
        if (v2 > 1) v2 = 1;
        v = (.1 + .9 * j / jk) % 1;
        rr = 96 + v * 128;
        gg =
          96 + v * 128;
        bb = v * 80;
        rr += (255 * 1.2 - rr) * .6 * v2;
        gg += (255 * 1.2 - gg) * .6 * v2;
        bb += (255 * 1 - bb) * .6 * v2;
        v = 1
      } else if (i == 33) {
        v2 = Math.sqrt(Math.pow(.5 * (xx - ksz2), 2) + Math.pow(1 * (yy - ksz2), 2)) / ksz2;
        v2 = Math.pow(v2, 2);
        if (v2 > 1) v2 = 1;
        v = (.1 + .9 * j / jk) % 1;
        rr = 96 + v * 128;
        gg = 48 + v * 80;
        bb = v * 48;
        rr += (255 * 1.2 - rr) * .6 * v2;
        gg += (255 * 1.1 - gg) * .6 * v2;
        bb += (255 * 1 - bb) * .6 * v2;
        v = 1
      } else if (i == 34) {
        v2 = Math.sqrt(Math.pow(.5 * (xx - ksz2), 2) + Math.pow(1 * (yy - ksz2), 2)) / ksz2;
        v2 = Math.pow(v2, 2);
        if (v2 > 1) v2 = 1;
        v = (.1 + .9 * j / jk) % 1;
        rr = 96 + v * 128;
        gg = v * 80;
        bb = 96 + v * 128;
        rr += (255 * 1.2 - rr) *
          .6 * v2;
        gg += (255 * 1 - gg) * .6 * v2;
        bb += (255 * 1.2 - bb) * .6 * v2;
        v = 1
      } else if (i == 35) {
        v2 = Math.sqrt(Math.pow(.5 * (xx - ksz2), 2) + Math.pow(1 * (yy - ksz2), 2)) / ksz2;
        v2 = Math.pow(v2, 2);
        if (v2 > 1) v2 = 1;
        v = (.1 + .9 * j / jk) % 1;
        rr = v * 80;
        gg = 96 + v * 128;
        bb = v * 80;
        rr += (255 * 1 - rr) * .6 * v2;
        gg += (255 * 1.2 - gg) * .6 * v2;
        bb += (255 * 1 - bb) * .6 * v2;
        v = 1
      } else if (i == 36) {
        v3 = (j / jk + .6 + .25 * (xx / ksz)) % 1;
        v2 = (yy - ksz2) / ksz;
        v2 = 1.3 * (v2 - 1.3 * (v3 - .5));
        v2 = v2 * 2;
        if (v2 < 0) v2 = -v2;
        v2 *= 2.4;
        if (v2 < 1) {
          rr += (255 * 2.2 - rr) * 1 * (1 - v2);
          gg += (255 * 2.2 - gg) * 1 * (1 - v2);
          bb += (255 * 2.2 - bb) * 1 * (1 - v2)
        }
        if (v3 < .5) v2 = (yy - ksz2 *
          .055 - ksz2) / ksz;
        else v2 = (yy + ksz2 * .055 - ksz2) / ksz;
        v2 = 1.3 * (v2 - 1.3 * (v3 - .5));
        v2 = v2 * 2;
        if (v2 < 0) v2 = -v2;
        v2 *= 4.8;
        if (v2 < 1) {
          rr += (255 * 1 - rr) * 1 * (1 - v2);
          gg += (32 * 1 - gg) * 1 * (1 - v2);
          bb += (64 * 1 - bb) * 1 * (1 - v2)
        }
        v2 = (ksz2 - yy) / ksz;
        v2 = 1.3 * (v2 - 1.3 * (v3 - .5));
        v2 = v2 * 2;
        if (v2 < 0) v2 = -v2;
        v2 *= 2.4;
        if (v2 < 1) {
          rr += (255 * 2.2 - rr) * 1 * (1 - v2);
          gg += (255 * 2.2 - gg) * 1 * (1 - v2);
          bb += (255 * 2.2 - bb) * 1 * (1 - v2)
        }
        if (v3 < .5) v2 = (ksz2 + ksz2 * .055 - yy) / ksz;
        else v2 = (ksz2 - ksz2 * .055 - yy) / ksz;
        v2 = 1.3 * (v2 - 1.3 * (v3 - .5));
        v2 = v2 * 2;
        if (v2 < 0) v2 = -v2;
        v2 *= 4.8;
        if (v2 < 1) {
          rr += (255 * 1 - rr) * 1 * (1 - v2);
          gg += (32 *
            1 - gg) * 1 * (1 - v2);
          bb += (64 * 1 - bb) * 1 * (1 - v2)
        }
        v2 = (yy - ksz2) / ksz;
        if (v3 >= .47 && v3 <= .53) {
          rr = 255;
          gg = 32;
          bb = 64
        } else if (v2 >= -.1 && v2 <= .1) {
          v3 = .5 - v3;
          if (v3 < 0) v3 = -v3;
          v3 = 1 - Math.pow(v3 / .5, 2);
          rr += (255 - rr) * v3;
          gg += (32 - gg) * v3;
          bb += (64 - bb) * v3
        } else if (v3 >= .44 && v3 <= .56 || v2 >= -.15 && v2 <= .15) {
          v3 = .5 - v3;
          if (v3 < 0) v3 = -v3;
          v3 = 1 - Math.pow(v3 / .5, 2);
          rr += (255 - rr) * v3;
          gg += (255 - gg) * v3;
          bb += (255 - bb) * v3
        }
        if (!nsr) {
          v = Math.pow(Math.max(0, Math.min(1, 1 - Math.abs(yy - ksz2) / ksz2)), .35);
          v2 = Math.pow(Math.max(0, Math.min(1, 1 - Math.abs(yy - ksz2) / ksz2)), .5);
          rr += (rrs[i] -
            rr) * (1 - v2);
          gg += (ggs[i] - gg) * (1 - v2);
          bb += (bbs[i] - bb) * (1 - v2)
        }
      } else if (i == 41) {
        v2 = Math.sqrt(Math.pow(.5 * (xx - ksz2), 2) + Math.pow(1 * (yy - ksz2), 2)) / ksz2;
        v2 = Math.pow(v2, 2);
        if (v2 > 1) v2 = 1;
        v = (.1 + .9 * j / jk) % 1;
        rr = v * 240;
        gg = v * 255;
        bb = 160 + v * 255;
        rr += (255 * 1 - rr) * .3 * v2;
        gg += (255 * 1 - gg) * .3 * v2;
        bb += (255 * 1.4 - bb) * .3 * v2;
        v = 1
      } else v *= 1.22 - .44 * j / (jk - 1);
      imgd[p] = Math.max(0, Math.min(255, Math.floor(rr * v)));
      imgd[p + 1] = Math.max(0, Math.min(255, Math.floor(gg * v)));
      imgd[p + 2] = Math.max(0, Math.min(255, Math.floor(bb * v)));
      xx++;
      if (xx >= ksz) {
        xx = 0;
        yy++
      }
    }
    ctx.putImageData(map,
      0, 0);
    var kmc2 = document.createElement("canvas");
    kmc2.width = kmc2.height = ksz;
    var ctx2 = kmc2.getContext("2d");
    ctx2.drawImage(kmainCanvas, 0, 0);
    if (i == 10) {
      var fk = -1;
      var tk = 1;
      if (nsr) {
        fk = -4;
        tk = 3
      }
      for (var k = fk; k <= tk; k++) {
        var tx = ksz2 + Math.cos(2 * Math.PI * k / 8) * (ksz2 / 16) * 13;
        var ty = ksz2 + Math.sin(2 * Math.PI * k / 8) * (ksz2 / 16) * 13;
        ctx2.fillStyle = "#FFFFFF";
        ctx2.beginPath();
        for (var m = 0; m <= 5; m++) {
          xx = tx + Math.cos(2 * Math.PI * m / 5) * 24 * .05 * (ksz / 32);
          yy = ty + Math.sin(2 * Math.PI * m / 5) * 24 * .05 * (ksz / 32);
          if (m == 0) ctx2.moveTo(xx, yy);
          else ctx2.lineTo(xx,
            yy);
          xx = tx + Math.cos(2 * Math.PI * (m + .5) / 5) * 62 * .05 * (ksz / 32);
          yy = ty + Math.sin(2 * Math.PI * (m + .5) / 5) * 62 * .05 * (ksz / 32);
          ctx2.lineTo(xx, yy)
        }
        ctx2.fill()
      }
    } else if (i == 19) {
      var fk = -2;
      var tk = 2;
      if (nsr) {
        fk = -7;
        tk = 7
      }
      for (var k = fk; k <= tk; k++) {
        var tx = ksz2 + Math.cos(2 * Math.PI * k / 15) * (ksz2 / 16) * 13;
        var ty = ksz2 + Math.sin(2 * Math.PI * k / 15) * (ksz2 / 16) * 13;
        ctx2.save();
        ctx2.globalAlpha = .7;
        ctx2.fillStyle = "#FFFFFF";
        ctx2.beginPath();
        for (var m = 0; m <= 5; m++) {
          xx = tx + Math.cos(2 * Math.PI * m / 5) * 12 * .05 * (ksz / 32);
          yy = ty + Math.sin(2 * Math.PI * m / 5) * 12 * .05 * (ksz / 32);
          if (m == 0) ctx2.moveTo(xx, yy);
          else ctx2.lineTo(xx, yy);
          xx = tx + Math.cos(2 * Math.PI * (m + .5) / 5) * 31 * .05 * (ksz / 32);
          yy = ty + Math.sin(2 * Math.PI * (m + .5) / 5) * 31 * .05 * (ksz / 32);
          ctx2.lineTo(xx, yy)
        }
        ctx2.fill();
        ctx2.restore()
      }
    } else if (i == 20) {
      var fk = -1.5;
      var tk = 1.5;
      if (nsr) {
        fk = -6.5;
        tk = 7.5
      }
      for (var k = fk; k <= tk; k++) {
        var tx = ksz2 + Math.cos(2 * Math.PI * k / 15) * (ksz2 / 16) * 13;
        var ty = ksz2 + Math.sin(2 * Math.PI * k / 15) * (ksz2 / 16) * 13;
        ctx2.save();
        ctx2.globalAlpha = .7;
        ctx2.fillStyle = "#FFFFFF";
        ctx2.beginPath();
        for (var m = 0; m <= 5; m++) {
          xx = tx + Math.cos(2 * Math.PI *
            m / 5) * 14 * .05 * (ksz2 / 16);
          yy = ty + Math.sin(2 * Math.PI * m / 5) * 14 * .05 * (ksz2 / 16);
          if (m == 0) ctx2.moveTo(xx, yy);
          else ctx2.lineTo(xx, yy);
          xx = tx + Math.cos(2 * Math.PI * (m + .5) / 5) * 36 * .05 * (ksz2 / 16);
          yy = ty + Math.sin(2 * Math.PI * (m + .5) / 5) * 36 * .05 * (ksz2 / 16);
          ctx2.lineTo(xx, yy)
        }
        ctx2.fill();
        ctx2.restore()
      }
    }
    if (iioc && testing)
      if (kmcs.length >= 1) kmcs.push(kmcs[0]);
      else if (per_color_imgs.length >= 2) kmcs.push(per_color_imgs[0].kmcs[0]);
    else {
      var u = kmc2.toDataURL();
      var ii = document.createElement("img");
      ii.src = "ayy.png";
      kmcs.push(ii)
    } else kmcs.push(kmc2);
    if (useWebGL) {
      var txo = {};
      txo.cc = kmc2;
      txo.sheet = 0;
      textures.push(txo);
      kmouseOverStates.push(txo)
    }
  }
  o.kmcs = kmcs;
  o.kmouseOverStates = kmouseOverStates;
  o.kl = kmcs.length;
  o.klp = true;
  if (i == 36) o.klp = false;
  per_color_imgs.push(o);
  if (useWebGL) {
    var j = 18.8;
    rr = rrs[i];
    gg = ggs[i];
    bb = bbs[i];
    if (i <= 9) {
      var wodo = {};
      var wfdo = {};
      var wgdo = {};
      var cc = document.createElement("canvas");
      var sz = 64;
      cc.width = cc.height = sz;
      var ctx = cc.getContext("2d");
      var eam = .2;
      var g = ctx.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2);
      g.addColorStop(0, "rgba(" + rr + ", " + gg + ", " + bb + ", 1)");
      g.addColorStop(.99,
        "rgba(" + Math.floor(rr * eam) + ", " + Math.floor(gg * eam) + ", " + Math.floor(bb * eam) + ", 1)");
      g.addColorStop(1, "rgba(" + Math.floor(rr * eam) + ", " + Math.floor(gg * eam) + ", " + Math.floor(bb * eam) +
        ", 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, sz, sz);
      wodo.cc = cc;
      wodo.sheet = 0;
      textures.push(wodo);
      o.wodo = wodo;
      var j = 18.8;
      var cc = document.createElement("canvas");
      var sz = Math.ceil(j * 2.5 + 28);
      cc.width = cc.height = sz;
      var ctx = cc.getContext("2d");
      ctx.fillStyle = o.cs;
      ctx.arc(sz / 2, sz / 2, j * .65, 0, TWO_PI);
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 0;
      ctx.shadowColor =
        o.cs;
      ctx.globalAlpha = .8;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fill();
      wfdo.cc = cc;
      wfdo.sheet = 0;
      textures.push(wfdo);
      o.wfdo = wfdo;
      sz = 64;
      var cc = document.createElement("canvas");
      cc.width = cc.height = sz;
      var ctx = cc.getContext("2d");
      var g = ctx.createRadialGradient(sz / 2, sz / 2, 1, sz / 2, sz / 2, sz / 2);
      g.addColorStop(0, "rgba(" + rr + ", " + gg + ", " + bb + ", 1)");
      g.addColorStop(1, "rgba(" + rr + ", " + gg + ", " + bb + ", 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, sz, sz);
      wgdo.cc = cc;
      wgdo.sheet = 0;
      textures.push(wgdo);
      o.wgdo = wgdo;
      sz = 128;
      var cc = document.createElement("canvas");
      cc.width = cc.height = sz;
      var ctx = cc.getContext("2d");
      var g = ctx.createRadialGradient(sz / 2, sz / 2, 1, sz / 2, sz / 2, 63);
      g.addColorStop(0, "rgba(" + rr + ", " + gg + ", " + bb + ", 1)");
      g.addColorStop(1, "rgba(" + rr + ", " + gg + ", " + bb + ", 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, sz, sz);
      var gpro = {};
      gpro.cc = cc;
      gpro.sheet = 0;
      textures.push(gpro);
      o.gpro = gpro
    }
  } else if (i <= 9)
    for (var j = 2.8; j <= 18.8; j += 1) {
      var cc = document.createElement("canvas");
      var sz = Math.ceil(2 * (j * .65 + 0 * 6));
      cc.width = cc.height = sz;
      var ctx = cc.getContext("2d");
      var eam = .2;
      var g = ctx.createRadialGradient(sz /
        2, sz / 2, 0, sz / 2, sz / 2, sz / 2);
      var trr = rr;
      var tgg = gg;
      var tbb = bb;
      if (i == 1);
      else if (i == 9) {
        trr = 160;
        tgg = 160;
        tbb = 160
      }
      g.addColorStop(0, "rgba(" + trr + ", " + tgg + ", " + tbb + ", 1)");
      g.addColorStop(.99, "rgba(" + trr + ", " + tgg + ", " + tbb + ", " + eam + ")");
      g.addColorStop(1, "rgba(" + trr + ", " + tgg + ", " + tbb + ", 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, sz, sz);
      if (iioc && testing) {
        var u = cc.toDataURL();
        var ii = document.createElement("img");
        ii.src = u;
        o.imgs.push(ii)
      } else o.imgs.push(cc);
      o.fwebSocket.push(sz);
      o.fhs.push(sz);
      o.fw2s.push(sz / 2);
      o.fh2s.push(sz /
        2);
      sz = Math.ceil(j * 8 + 6);
      var cc = document.createElement("canvas");
      cc.width = cc.height = sz;
      var ctx = cc.getContext("2d");
      var g = ctx.createRadialGradient(sz / 2, sz / 2, 1, sz / 2, sz / 2, j * 4);
      g.addColorStop(0, "rgba(" + rr + ", " + gg + ", " + bb + ", 1)");
      g.addColorStop(1, "rgba(" + rr + ", " + gg + ", " + bb + ", 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, sz, sz);
      if (iioc && testing) {
        var u = cc.toDataURL();
        var ii = document.createElement("img");
        ii.src = u;
        o.gimgs.push(ii)
      } else o.gimgs.push(cc);
      o.gfwebSocket.push(sz);
      o.gfhs.push(sz);
      o.gfw2s.push(sz / 2);
      o.gfh2s.push(sz /
        2);
      var cc = document.createElement("canvas");
      var bsz = Math.ceil(2 * (j * .7 + 0 * 6)) + 2;
      var sz = bsz + 20;
      cc.width = cc.height = sz;
      var ctx = cc.getContext("2d");
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 1 + 2 * j / 18.8;
      ctx.shadowColor = "#000000";
      ctx.globalAlpha = 1;
      ctx.beginPath();
      for (var k = 0; k <= 600; k++) {
        xx = sz / 2 + Math.cos(2 * Math.PI * k / 600) * bsz / 2;
        yy = sz / 2 + Math.sin(2 * Math.PI * k / 600) * bsz / 2;
        if (k == 0) ctx.moveTo(xx, yy);
        else ctx.lineTo(xx, yy)
      }
      ctx.fill();
      if (iioc && testing) {
        var u = cc.toDataURL();
        var ii = document.createElement("img");
        ii.src = u;
        o.oimgs.push(ii)
      } else o.oimgs.push(cc);
      o.ofwebSocket.push(sz);
      o.ofhs.push(sz);
      o.ofw2s.push(sz / 2);
      o.ofh2s.push(sz / 2)
    }
  if (i <= 9) {
    if (!useWebGL) {
      o.ic = o.imgs.length;
      o.pr_imgs = [];
      o.pr_fwebSocket = [];
      o.pr_fhs = [];
      o.pr_fw2s = [];
      o.pr_fh2s = [];
      var cc;
      var sz;
      var ctx;
      for (var j = 3; j <= 24; j += 1) {
        cc = document.createElement("canvas");
        sz = Math.ceil(j * 2 + 38);
        cc.width = cc.height = sz;
        ctx = cc.getContext("2d");
        ctx.fillStyle = o.cs;
        ctx.arc(sz / 2, sz / 2, j / 2, 0, TWO_PI);
        ctx.shadowBlur = 22;
        ctx.shadowOffsetY = 0;
        ctx.shadowColor = "#" + rs + gs + bs;
        ctx.fill();
        ctx.fill();
        if (iioc && testing) {
          var u = cc.toDataURL();
          var ii =
            document.createElement("img");
          ii.src = u;
          o.pr_imgs.push(ii)
        } else o.pr_imgs.push(cc);
        o.pr_fwebSocket.push(sz);
        o.pr_fhs.push(sz);
        o.pr_fw2s.push(sz / 2);
        o.pr_fh2s.push(sz / 2)
      }
    }
    if (useWebGL) {
      cc = document.createElement("canvas");
      sz = Math.ceil(24 * 2 + 38);
      cc.width = cc.height = sz;
      ctx = cc.getContext("2d");
      ctx.fillStyle = o.cs;
      ctx.arc(sz / 2, sz / 2, 24 / 2, 0, TWO_PI);
      ctx.shadowBlur = 22;
      ctx.shadowOffsetY = 0;
      ctx.shadowColor = "#" + rs + gs + bs;
      ctx.fill();
      ctx.fill();
      var pro = {};
      pro.cc = cc;
      pro.sheet = 0;
      textures.push(pro);
      o.pro = pro
    }
  }
}
if (testing) {
  var ctx = colc.getContext("2d");
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, colc.width, colc.height);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "10px Arial, Helvetica Neue, Helvetica, sans-serif";
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  var xx = 0;
  var yy = 0;
  for (var i = 0; i < rrs.length; i++) {
    var pci = per_color_imgs[i];
    var kmainCanvas = pci.kmcs[0];
    ctx.drawImage(kmainCanvas, 0, 0, kmainCanvas.width, kmainCanvas.height, xx, yy, 16, 16);
    ntx = o.headX + o.interpOffsetX;
    nty = o.headY + o.interpOffsetY;
    ntx = canvasWidthHalf + (ntx - viewX) * gameScale;
    nty = canvasHeightHalf + (nty - viewY) * gameScale;
    ctx.fillText("" + i, xx + 8, yy + 16);
    xx +=
      16;
    if (xx > colc.width - 16) {
      xx = 0;
      yy += 28
    }
  }
}
var viewX = 0;
var viewY = 0;
var viewAngle = 0;
var viewDistance = 0;
var followViewX = 0;
var followViewY = 0;
var mouseX = 0;
var mouseY = 0;
var lastSentMouseX = 0;
var lastSentMouseY = 0;
var playerSnake = null;
var myNickname = "";
var gw2k16 = false;
try {
  if (localStorage.gw2k16 == "1") gw2k16 = true
} catch (e) {}
var dhx, dhy, hsz;
var frameCounter = 0;
var lastFrameCounter = 0;
var lastTime = timeObject.now();
var frameDelta = 0;
var frameDeltaInt = 0;
var actualFrameDelta = 0;
var aframeCounter = 0;
var fr2 = 0;
var lfr2 = 0;
var vfrb2 = 0;
var currentPingTime = 0;
var lastPingTime = 0;
var lastPingSendTime = 0;
var lastPingTime = 0;
var wantElapsedTimeSync = false;
var wantSequence = false;
var lastSequence = 0;
var isLagging = false;
var lagMultiplier = 1;
var waitingForPong = false;
var highQuality = true;
var graphicsLevelAlpha = 1;
var wantDecreaseGraphicsFrames = 0;
var qualityScaleMult = 1;
var maxQualityScaleMult = 1.7;
var isPlaying = false;
var isConnected = false;
var wantCloseSocket = false;
var wantVictoryMessage = false;
var wantVictoryFocus = false;
var wantHideVictory = 0;
var hideVictoryFade = 0;
var deadTime = -1;
var at2lt = new Float32Array(65536);
for (yy = 0; yy < 256; yy++)
  for (xx = 0; xx < 256; xx++) at2lt[yy << 8 | xx] = Math.atan2(yy - 128, xx - 128);
var keyDownLeftFrames = 0;
var keyDownRightFrames = 0;
var keyDownLeft = false;
var keyDownRight = false;
var keyDownUp = false;
var lastKeySendTime = 0;
var social = document.createElement("iframe");
try {
  social.frameBorder = 0
} catch (e) {}
social.style.position = "fixed";
social.style.left = "6px";
social.style.top = "6px";
social.style.border = "0px";
social.style.zIndex = 999;
social.style.overflow = "hidden";
social.width = 251;
social.height = 150;
social.src = "http://slither.io/social-box/";
document.body.appendChild(social);
var gameLoop = function() {
  if (wantHoverMouseOverState) handleMouseOverState();
  var currentTime = timeObject.now();
  frameDelta = (currentTime - lastTime) / 8;
  if (frameDelta > 5) frameDelta = 5;
  if (frameDelta < 0) frameDelta = 0;
  actualFrameDelta = frameDelta;
  lastTime = currentTime;
  if (!choosingSkin) {
    if (!isLagging)
      if (waitingForPong && currentTime - lastPingTime > 750)
        if (!wantPlay)
          if (!checkingCode) isLagging = true;
    if (isLagging) {
      lagMultiplier *= .85;
      if (lagMultiplier < .2) lagMultiplier = .2
    } else if (lagMultiplier < 1) {
      lagMultiplier += .05;
      if (lagMultiplier >= 1) lagMultiplier = 1
    }
  }
  if (frameDelta > 120) frameDelta = 120;
  frameDelta *= lagMultiplier;
  lastFrameCounter = frameCounter;
  frameCounter += frameDelta;
  frameDeltaInt = Math.floor(frameCounter) - Math.floor(lastFrameCounter);
  lfr2 = fr2;
  fr2 += frameDelta * 2;
  vfrb2 = Math.floor(fr2) - Math.floor(lfr2);
  aframeCounter += actualFrameDelta;
  if (isConnected)
    if (playerSnake !=
      null) {
      if (keyDownLeft) keyDownLeftFrames += frameDeltaInt;
      if (keyDownRight) keyDownRightFrames += frameDeltaInt
    } if (wantPlay && !showAd)
    if (deadTime == -1) connectToServer();
  if (buildia_shown)
    if (buildia_close_after_tm != -1)
      if (currentTime > buildia_close_after_tm) trySkipBuildia();
  var svlch = false;
  if (svl_showing) {
    svlch = true;
    svl_a += frameDelta * .02;
    if (svl_a >= 1) {
      svl_showing = false;
      svl_a = 1
    }
  } else if (svl_hiding) {
    svlch = true;
    svl_a -= frameDelta * .025;
    if (svl_a <= 0) {
      svl_hiding = false;
      svl_bg.style.display = "none";
      svl.style.display = "none";
      svl_a = 0
    }
  }
  if (svlch) {
    scaleSvl();
    svl_bg.style.opacity = .88 * svl_a;
    svl.style.opacity = svl_a
  }
  if (spinnerShown) {
    loadingSpinnerFrame +=
      actualFrameDelta;
    var ctx = loadingMinimapCanvas.getContext("2d");
    ctx.clearRect(0, 0, 512, 128);
    var ic = 256;
    var rad;
    var k;
    for (var j = 1; j <= 2; j++) {
      ctx.beginPath();
      if (j == 1) {
        ctx.fillStyle = "#60FF70";
        k = 0
      } else {
        ctx.fillStyle = "#9850FF";
        k = Math.PI
      }
      for (var i = 0; i <= ic; i++) {
        rad = 32 + Math.cos(k + loadingSpinnerFrame / 6 + 8 * i / ic) * 5 + 8 * i / ic;
        if (i == ic) rad += 10;
        xx = 64 + Math.cos(k + loadingSpinnerFrame / 44 + .8 * Math.PI * i / ic) * rad * 1.25;
        yy = 64 + Math.sin(k + loadingSpinnerFrame / 44 + .8 * Math.PI * i / ic) * rad;
        if (i == 0) ctx.moveTo(xx, yy);
        else ctx.lineTo(xx, yy)
      }
      rad = 32;
      xx = 64 + Math.cos(k + loadingSpinnerFrame / 44 + .8 * Math.PI * (i + 47) / ic) * rad * 1.25;
      yy = 64 + Math.sin(k +
        loadingSpinnerFrame / 44 + .8 * Math.PI * (i + 47) / ic) * rad;
      ctx.lineTo(xx, yy);
      for (var i = ic; i >= 0; i--) {
        rad = 32 + Math.cos(k + loadingSpinnerFrame / 6 + 8 * i / ic) * 5 - 8 * i / ic;
        if (i == ic) rad -= 10;
        xx = 64 + Math.cos(k + loadingSpinnerFrame / 44 + .8 * Math.PI * i / ic) * rad * 1.25;
        yy = 64 + Math.sin(k + loadingSpinnerFrame / 44 + .8 * Math.PI * i / ic) * rad;
        ctx.lineTo(xx, yy)
      }
      ctx.fill()
    }
    if (isConnecting || wantPlay) {
      startShowAlpha += actualFrameDelta / 86;
      if (startShowAlpha >= 1) startShowAlpha = 1;
      startShowScale += actualFrameDelta / 93;
      if (startShowScale >= 1) startShowScale = 1;
      loadingMinimapCanvas.style.opacity = startShowAlpha;
      var sc = Math.round(.1 + .9 * startShowScale * (1 + 2 * Math.pow(1 - startShowAlpha, 2)) * 1E5) / 1E5;
      setTransform(loadingMinimapCanvas, "scale(" + sc + "," + sc + ")")
    } else {
      startShowAlpha -= actualFrameDelta / 86;
      if (startShowAlpha <=
        0) {
        startShowAlpha = 0;
        startShowScale = 0;
        loadingMinimapCanvas.style.display = "none";
        setTransform(loadingMinimapCanvas, "")
      }
      loadingMinimapCanvas.style.opacity = startShowAlpha;
      var sc = Math.round(.1 + .9 * startShowScale * (1 + 2 * Math.pow(1 - startShowAlpha, 2)) * 1E5) / 1E5;
      setTransform(loadingMinimapCanvas, "scale(" + sc + "," + sc + ")")
    }
  }
  if (enteringCode || endingEnterCode) {
    for (var i = etcobs.length - 1; i >= 0; i--) {
      var o = etcobs[i];
      if (o.loaded)
        if (checkingCode) {
          if (o.alpha != .25) {
            o.alpha -= frameDelta * .02;
            if (o.alpha <= .25) o.alpha = .25;
            o.ii.style.opacity = o.alpha
          }
        } else if (o.alpha != 1) {
        o.alpha += frameDelta * .02;
        if (o.alpha >= 1) o.alpha = 1;
        o.ii.style.opacity = o.alpha
      }
    }
    if (endingEnterCode) {
      etca -=
        frameDelta * .03;
      if (etca <= 0) {
        etca = 0;
        etcbx = 0;
        etcdx = etc_ww / 2 - 54 / 2;
        etcods = [];
        endingEnterCode = false;
        enteringCode = false;
        etcod.style.display = "none";
        nicknameInput.disabled = false;
        nicknameInput.focus();
        if (wantOpenCosmetics) {
          wantOpenCosmetics = false;
          csk.onclick();
          scos.onclick()
        }
      }
      etcod.style.opacity = etca
    } else if (enteringCode)
      if (etca != 1) {
        etca += frameDelta * .03;
        if (etca >= 1) etca = 1;
        etcod.style.opacity = etca
      } etcba += frameDelta * .1;
    if (etcba >= TWO_PI) etcba -= TWO_PI;
    if (etcshk) {
      etcshkv += frameDelta * .014;
      if (etcshkv >= 1) {
        etcshkv = 1;
        etcshk = false
      }
      etcc.style.left = Math.round((Math.sin(Math.PI *
        etcshkv * 8) * 32 * Math.sin(Math.PI * etcshkv) + ww / 2 - etc_ww / 2) * 10) / 10 + "px"
    }
    if (checkingCode || etcsa > 0) {
      etcsv += frameDelta * .0075;
      if (etcsv >= 1) etcsv -= 1;
      if (checkingCode) {
        etcsa += frameDelta * .02;
        if (etcsa >= 1) etcsa = 1
      } else {
        etcsa -= frameDelta * .05;
        if (etcsa <= 0) etcsa = 0
      }
      etco_sp_ii.style.opacity = etcsa;
      var letcsrv = etcsrv;
      etcsrv = Math.round(etcsv * 12);
      if (etcsrv != letcsrv) adjustCodeSpinner()
    }
    if (etcods.length == 14) {
      if (etcbaa != 0) {
        etcbaa -= frameDelta * .05;
        if (etcbaa <= 0) etcbaa = 0
      }
    } else if (etcbaa != 1) {
      etcbaa += frameDelta * .05;
      if (etcbaa >= 1) etcbaa = 1
    }
    var ctx = etcc.getContext("2d");
    ctx.save();
    ctx.clearRect(0, 0, etc_ww, etc_hh);
    var el = Math.min(13, etcods.length);
    etcbx += (el * 47 - etcbx) * .2;
    etcdx += (etc_ww / 2 - 54 / 2 - 47 * el / 2 - etcdx) * .1;
    ctx.globalAlpha = 1;
    ctx.translate(etcdx, 0);
    for (var i = 0; i < etcods.length; i++) {
      var v = etcods[i].v;
      if (etcdis[v].loaded) ctx.drawImage(etcdis[v].ii, i * 47, 0, 54, 67)
    }
    if (etcdis[11].loaded) {
      ctx.globalAlpha = etcbaa * (.5 + .4 * Math.cos(etcba));
      ctx.drawImage(etcdis[11].ii, etcbx, 0, 54, 67)
    }
    ctx.restore()
  }
  if (endingBuildSkin) {
    if (buildSkinAlpha != 0) {
      buildSkinAlpha -= frameDelta * .015;
      if (buildSkinAlpha <= 0) {
        buildSkinAlpha = 0;
        endingBuildSkin =
          false;
        buildingSkin = false;
        alcsc = ralcsc;
        for (var i = buildSkinButtons.length - 1; i >= 0; i--) document.body.removeChild(buildSkinButtons[i].a);
        buildSkinButtons = [];
        revertDiv.style.display = "none"
      }
      var k = .5 * (1 - Math.cos(Math.PI * buildSkinAlpha));
      bskoy = k * 90;
      skinOptionsYOffset = k;
      reposSkinStuff();
      prevSkinHolder.style.opacity = 1 - buildSkinAlpha;
      nextSkinHolder.style.opacity = 1 - buildSkinAlpha;
      buildSkinHolder.style.opacity = 1 - buildSkinAlpha;
      selectCosmeticHolder.style.opacity = 1 - buildSkinAlpha;
      revertDiv.style.opacity = buildSkinAlpha;
      for (var i = buildSkinButtons.length - 1; i >= 0; i--) {
        var o = buildSkinButtons[i];
        o.ii.style.opacity = buildSkinAlpha
      }
    }
  } else if (buildingSkin)
    if (buildSkinAlpha != 1) {
      buildSkinAlpha += frameDelta * .015;
      if (buildSkinAlpha >=
        1) buildSkinAlpha = 1;
      var k = .5 * (1 - Math.cos(Math.PI * buildSkinAlpha));
      bskoy = k * 90;
      skinOptionsYOffset = k;
      reposSkinStuff();
      prevSkinHolder.style.opacity = 1 - buildSkinAlpha;
      nextSkinHolder.style.opacity = 1 - buildSkinAlpha;
      buildSkinHolder.style.opacity = 1 - buildSkinAlpha;
      selectCosmeticHolder.style.opacity = 1 - buildSkinAlpha;
      revertDiv.style.opacity = buildSkinAlpha;
      for (i = buildSkinButtons.length - 1; i >= 0; i--) {
        var o = buildSkinButtons[i];
        o.ii.style.opacity = buildSkinAlpha
      }
    } if (endingSelectCosmetic) {
    if (selectCosmeticAlpha != 0) {
      selectCosmeticAlpha -= frameDelta * .015;
      if (selectCosmeticAlpha <= 0) {
        selectCosmeticAlpha = 0;
        endingSelectCosmetic = false;
        selectingCosmetic = false;
        for (var i = cosmeticButtons.length - 1; i >= 0; i--) document.body.removeChild(cosmeticButtons[i].a);
        cosmeticButtons = []
      }
      var k = .5 * (1 - Math.cos(Math.PI * selectCosmeticAlpha));
      secosoy = k * 90;
      selectCosmeticYOffset = k;
      reposSkinStuff();
      prevSkinHolder.style.opacity = 1 - selectCosmeticAlpha;
      nextSkinHolder.style.opacity = 1 - selectCosmeticAlpha;
      buildSkinHolder.style.opacity = 1 - selectCosmeticAlpha;
      selectCosmeticHolder.style.opacity = 1 - selectCosmeticAlpha;
      for (var i = cosmeticButtons.length - 1; i >= 0; i--) {
        var o = cosmeticButtons[i];
        o.ii.style.opacity = selectCosmeticAlpha
      }
    }
  } else if (selectingCosmetic)
    if (selectCosmeticAlpha != 1) {
      selectCosmeticAlpha += frameDelta * .015;
      if (selectCosmeticAlpha >= 1) selectCosmeticAlpha = 1;
      var k = .5 * (1 - Math.cos(Math.PI * selectCosmeticAlpha));
      secosoy = k * 90;
      selectCosmeticYOffset = k;
      reposSkinStuff();
      prevSkinHolder.style.opacity = 1 - selectCosmeticAlpha;
      nextSkinHolder.style.opacity = 1 - selectCosmeticAlpha;
      buildSkinHolder.style.opacity =
        1 - selectCosmeticAlpha;
      selectCosmeticHolder.style.opacity = 1 - selectCosmeticAlpha;
      for (i = cosmeticButtons.length - 1; i >= 0; i--) {
        var o = cosmeticButtons[i];
        o.ii.style.opacity = selectCosmeticAlpha
      }
    } if (isConnecting)
    if (currentTime - startConnectTime > 3333) {
      if (bestServer)
        if (!bestServer.tainted) {
          bestServer.tainted = true;
          bestServer.tainted_mtm = currentTime;
          if (forcedBestServerObj != null) {
            forcedBestServerObj = null;
            forcing = false
          }
          if (bestServer.ip == "40.160.21.51") {
            teamsDisabled = true;
            if (teamsExist) {
              trumpbtnh.style.display = "none";
              votetxth.style.display = "none";
              kamalabtnh.style.display = "none"
            }
          }
        } connectToServer()
    } if (choosingSkin) {
    for (var i = allSnakes.length - 1; i >= 0; i--) {
      var o = allSnakes[i];
      for (var j = o.bodyPoints.length - 1; j >= 0; j--) o.bodyPoints[j].yy = arenaSize / 2 + Math.cos(j / 4 +
        frameCounter / 19) * 15 * (1 - j / o.bodyPoints.length);
      o.headX = o.bodyPoints[o.bodyPoints.length - 1].xx;
      o.headY = o.bodyPoints[o.bodyPoints.length - 1].yy
    }
    viewX -= frameDelta
  }
  if (!useWebGL)
    if (isPlaying)
      if (!highQuality) {
        if (graphicsLevelAlpha > 0) {
          graphicsLevelAlpha -= frameDelta * .0075;
          if (graphicsLevelAlpha < 0) graphicsLevelAlpha = 0
        }
        if (qualityScaleMult < maxQualityScaleMult) {
          qualityScaleMult += frameDelta * 4E-5;
          if (qualityScaleMult > maxQualityScaleMult) qualityScaleMult = maxQualityScaleMult
        }
      } else {
        if (graphicsLevelAlpha < 1) {
          graphicsLevelAlpha += frameDelta * .0075;
          if (graphicsLevelAlpha > 1) graphicsLevelAlpha = 1
        }
        if (qualityScaleMult > 1) {
          qualityScaleMult -= frameDelta * 4E-5;
          if (qualityScaleMult < 1) qualityScaleMult = 1
        }
      } if (wantHideVictory != 0)
    if (wantHideVictory == 1) {
      hideVictoryFade += frameDelta * .02;
      if (hideVictoryFade >= 1) {
        hideVictoryFade = 0;
        wantHideVictory = 2;
        victoryHolder.style.opacity =
          1;
        saveHolder.style.opacity = 1;
        victoryHolder.style.display = "none";
        saveHolder.style.display = "none";
        nicknameHolder.style.opacity = 0;
        playHolder.style.opacity = 0;
        skinMenuHolder.style.opacity = 0;
        nicknameHolder.style.display = "inline-block";
        playHolder.style.display = "block";
        skinMenuHolder.style.display = "block"
      } else {
        victoryHolder.style.opacity = 1 - hideVictoryFade;
        saveHolder.style.opacity = 1 - hideVictoryFade
      }
    } else if (wantHideVictory == 2) {
    hideVictoryFade += frameDelta * .02;
    if (hideVictoryFade >= 1) {
      hideVictoryFade = 1;
      wantHideVictory = 0
    }
    nicknameHolder.style.opacity = hideVictoryFade;
    playHolder.style.opacity = hideVictoryFade;
    skinMenuHolder.style.opacity = hideVictoryFade
  }
  if (loginFade != 1)
    if (tipFade !=
      -1) {
      tipFade += frameDelta * .017;
      if (tipFade >= TWO_PI) {
        tipFade -= TWO_PI;
        tipPosition++;
        if (tipPosition >= tipsStrings.length) tipPosition = 0;
        tipsElement.textContent = tipsStrings[tipPosition]
      }
      var j = .5 - .5 * Math.cos(tipFade);
      tipsElement.style.opacity = Math.round(Math.pow(j, .5) * 1E5) / 1E5
    } if (deadTime == -1) {
    if (leaderboardFade != -1)
      if (leaderboardFade != 1) {
        leaderboardFade += frameDelta * .01;
        if (leaderboardFade >= 1) leaderboardFade = 1;
        leaderboardHeader.style.opacity = leaderboardFade * .85;
        leaderboardScores.style.opacity = leaderboardNames.style.opacity = leaderboardPositions.style.opacity =
          leaderboardFooter.style.opacity = victoryMessage.style.opacity = leaderboardFade
      }
  } else if (currentTime - deadTime > 1600) {
    if (loginInterval == -1) {
      loginInterval = -2;
      loginElement.style.display = "inline";
      cosmeticSkinHolder.style.display =
        "inline";
      cosmeticServerHolder.style.display = "inline";
      if (!is_mobile)
        if (!teamsDisabled)
          if (teamsExist) {
            trumpbtnh.style.display = "inline";
            votetxth.style.display = "inline";
            kamalabtnh.style.display = "inline"
          } if (hacos || bonkz) enterCodeHolder.style.display = "inline";
      playQuality.style.display = "inline";
      closeQuality.style.display = "inline";
      graphicsQualityHolder.style.display = "inline";
      social.style.display = "inline";
      if (wantVictoryFocus) {
        wantVictoryFocus = false;
        victoryInput.focus()
      }
    }
    if (loginInterval == -2) {
      loginFade -= .004 * frameDelta;
      if (choosingSkin) loginFade -= .007 * frameDelta;
      leaderboardFade = loginFade;
      if (loginFade <=
        0) {
        loginFade = 0;
        deadTime = -1;
        nicknameInput.disabled = false;
        nicknameInput.focus();
        leaderboardFade = -1;
        isPlaying = false;
        if (choosingSkin) {
          choosingSkin = false;
          resetGameState();
          prevSkinHolder.style.display = "none";
          nextSkinHolder.style.display = "none";
          buildSkinHolder.style.display = "none";
          selectCosmeticHolder.style.display = "none";
          skinOptionsDiv.style.display = "none";
          revertDiv.style.display = "none"
        }
      }
      pbdiv.style.opacity = 1 - .5 * Math.max(0, Math.min(1, loginFade * 6));
      loginCurrentScale = 1 + .1 * Math.pow(loginFade, 2);
      var sc = Math.round(loginBaseScale * loginCurrentScale * 1E5) / 1E5;
      if (sc == 1) setTransform(loginElement, "");
      else setTransform(loginElement, "scale(" + sc + "," + sc + ")");
      loginElement.style.opacity =
        1 - loginFade;
      cosmeticSkinHolder.style.opacity = 1 - loginFade;
      cosmeticServerHolder.style.opacity = 1 - loginFade;
      if (teamsExist) {
        trumpbtnh.style.opacity = 1 - loginFade;
        votetxth.style.opacity = (1 - loginFade) * votetxt_a;
        kamalabtnh.style.opacity = 1 - loginFade
      }
      enterCodeHolder.style.opacity = 1 - loginFade;
      graphicsQualityHolder.style.opacity = 1 - loginFade;
      playQuality.style.opacity = 1 - loginFade;
      closeQuality.style.opacity = 1 - loginFade;
      social.style.opacity = 1 - loginFade;
      prevSkinHolder.style.opacity = loginFade;
      nextSkinHolder.style.opacity = loginFade;
      buildSkinHolder.style.opacity = loginFade;
      selectCosmeticHolder.style.opacity = loginFade;
      skinOptionsDiv.style.opacity = loginFade;
      revertDiv.style.opacity =
        loginFade;
      if (useWebGL) app.view.style.opacity = loginFade;
      mainCanvas.style.opacity = loginFade;
      locationHolder.style.opacity = loginFade * minimapAlpha;
      scoreboardMinimap.style.opacity = loginFade * teamScoreboardAlpha;
      leaderboardHeader.style.opacity = leaderboardFade * .85;
      leaderboardScores.style.opacity = leaderboardNames.style.opacity = leaderboardPositions.style.opacity =
        leaderboardFooter.style.opacity = victoryMessage.style.opacity = leaderboardFade
    }
  }
  if (wantCloseSocket)
    if (deadTime == -1) {
      wantCloseSocket = false;
      if (webSocket) {
        webSocket.close();
        webSocket = null;
        isConnected = false;
        isPlaying = false
      }
      resetGameState()
    } if (wantVictoryMessage) victoryBackground.style.opacity = .92 + .08 * Math.cos(frameCounter / 10);
  if (isConnected) {
    if (playerSnake != null)
      if (keyDownLeftFrames >
        0 || keyDownRightFrames > 0)
        if (currentTime - lastKeySendTime > 150) {
          lastKeySendTime = currentTime;
          if (keyDownRightFrames > 0)
            if (keyDownLeftFrames > keyDownRightFrames) {
              keyDownLeftFrames -= keyDownRightFrames;
              keyDownRightFrames = 0
            } if (keyDownLeftFrames > 0)
            if (keyDownRightFrames > keyDownLeftFrames) {
              keyDownRightFrames -= keyDownLeftFrames;
              keyDownLeftFrames = 0
            } if (keyDownLeftFrames > 0) {
            v = keyDownLeftFrames;
            if (v > 127) v = 127;
            keyDownLeftFrames -= v;
            playerSnake.eang -= turnRatePerFrame * v * playerSnake.scang * playerSnake.spang;
            if (protocolVersion >= 5) {
              var ba = new Uint8Array(2);
              ba[0] = 252;
              ba[1] = v
            } else {
              var ba = new Uint8Array(2);
              ba[0] = 108;
              ba[1] = v
            }
            webSocket.send(ba)
          } else if (keyDownRightFrames > 0) {
            v = keyDownRightFrames;
            if (v > 127) v = 127;
            keyDownRightFrames -= v;
            playerSnake.eang += turnRatePerFrame * v * playerSnake.scang * playerSnake.spang;
            if (protocolVersion >= 5) {
              v += 128;
              var ba = new Uint8Array(2);
              ba[0] = 252;
              ba[1] = v
            } else {
              var ba = new Uint8Array(2);
              ba[0] = 114;
              ba[1] = v
            }
            webSocket.send(ba)
          }
        } if (!waitingForPong)
      if (currentTime - lastPingTime > 250) {
        lastPingTime = currentTime;
        waitingForPong = true;
        var ba = new Uint8Array(1);
        if (protocolVersion >= 5) ba[0] = 251;
        else ba[0] = 112;
        webSocket.send(ba);
        lastPingSendTime = currentTime
      } if (frameDeltaInt > 0)
      if (fluxTarget > 0) {
        ki = frameDeltaInt;
        if (ki > fluxTarget) ki = fluxTarget;
        fluxTarget -= ki;
        for (qq = 1; qq <= ki; qq++) {
          if (qq == ki) fluxGradient = fluxGradients[fluxGradientPos];
          fluxGradients[fluxGradientPos] = realFluxGradient;
          fluxGradientPos++;
          if (fluxGradientPos >= fluxCount) fluxGradientPos =
            0
        }
      } else if (fluxTarget == 0) fluxTarget = -1;
    if (minimapGotData) {
      if (minimapAlpha != 1) {
        minimapAlpha += .025;
        if (minimapAlpha >= 1) minimapAlpha = 1;
        locationHolder.style.opacity = minimapAlpha
      }
      if (minimapBlendFrame < 1) {
        minimapBlendFrame += frameDelta / 230;
        if (minimapBlendFrame >= 1) minimapBlendFrame = 1;
        arenaMinimapCanvas.style.opacity = minimapState * (1 - minimapBlendFrame);
        arenaMinimapCanvas2.style.opacity = 1 - (1 - minimapState) / (1 - minimapState * (1 - minimapBlendFrame))
      }
    }
    if (team_mode) {
      if (teamScoreboardGotData)
        if (teamScoreboardAlpha != 1)
          if (trumpLoaded && kamalaLoaded || currentTime - teamScoreboardGotDataTime > 3E3) {
            teamScoreboardAlpha += .025;
            if (teamScoreboardAlpha >= 1) teamScoreboardAlpha = 1;
            scoreboardMinimap.style.opacity = teamScoreboardAlpha
          } if (trumpLoaded)
        if (trumpAlpha < 1) {
          trumpAlpha += .025;
          if (trumpAlpha >= 1) trumpAlpha = 1;
          trumpImage.style.opacity = trumpAlpha
        } if (kamalaLoaded)
        if (kamalaAlpha <
          1) {
          kamalaAlpha += .025;
          if (kamalaAlpha >= 1) kamalaAlpha = 1;
          kamalaImage.style.opacity = kamalaAlpha
        } if (team1EaseOut.tg > 0 || team2EaseOut.tg > 0) {
        var h1 = 0;
        var h2 = 0;
        team1VisibleScore = team1EaseOut.g(frameDeltaInt);
        team2VisibleScore = team2EaseOut.g(frameDeltaInt);
        if (team1VisibleScore + team2VisibleScore > 0) {
          h1 = Math.round(2E4 * team1VisibleScore / (team1VisibleScore + team2VisibleScore)) / 100;
          h2 = Math.round(2E4 * team2VisibleScore / (team1VisibleScore + team2VisibleScore)) / 100
        }
        h1 += 12;
        h2 += 12;
        team1Bar.style.height = h1 + "px";
        team2Bar.style.height = h2 + "px";
        setTransform(trumpImage, "scale(.5, .5) translateY(" + 2 * -(h1 - 22) + "px)");
        setTransform(kamalaImage, "scale(.5, .5) translateY(" + 2 * -(h2 -
          22) + "px)")
      }
    }
  }
  if (playerSnake != null)
    if (arenaSize != 2147483647)
      if (currentTime - locationUpdateTime > 150) {
        locationUpdateTime = timeObject.now();
        myLocationMarker.style.left = Math.round(10 * (minimapRadius + 12 + minimapRadius * (playerSnake.xx -
          arenaSize) / fluxGradient - 7)) / 10 + "px";
        myLocationMarker.style.top = Math.round(10 * (minimapRadius + 12 + minimapRadius * (playerSnake.yy -
          arenaSize) / fluxGradient - 7)) / 10 + "px"
      } if (currentTime - lastStatsResetTime > 1E3) {
    if (testing)
      if (console && console.log) {
        var eft = currentTime - lastStatsResetTime;
        var s = [];
        tbytesPerSecond += bytesPerSecond;
        if (isPlaying) tcsecs++;
        eft = Math.max(eft, pft);
        s.push("FPS: " + framesPerSecond);
        s.push("sectors: " + sectorList.length);
        s.push();
        s.push("foods: " + foodsCount);
        s.push("bundles/sec: " +
          avgPacketsPerSecond);
        s.push("packets/sec: " + packetsPerSecond);
        s.push("average packets per bundle: " + Math.round(100 * totalPackets / totalAvgPackets) / 100);
        s.push("bytes/sec: " + bytesPerSecond);
        s.push("bytes/sec avg: " + Math.round(tbytesPerSecond / tcsecs));
        s.push("");
        s.push("segments drawn: " + segmentsDrawn);
        s.push("foods drawn: " + foodsDrawn);
        s.push("");
        var total = 0;
        var total_packets = 0;
        for (var i = 0; i < rdpspc.length; i++) {
          if (rdpspc[i] >= 0) total += rdpspc[i];
          if (pkpspc[i] >= 0) total_packets += pkpspc[i]
        }
        for (var i = 0; i < rdpspc.length; i++)
          if (rdpspc[i] >= 1 || pkpspc[i] >= 1) s.push(String.fromCharCode(i) +
            ": " + pkpspc[i] + " packets, " + rdpspc[i] + " bytes (" + Math.round(rdpspc[i] / total * 1E3) / 10 +
            "%)");
        s.push("total packets: " + total_packets);
        s.push("total bytes: " + total);
        pf_add = 0;
        pf_new_add = 0;
        pf_remove = 0;
        pf_nap = 0;
        pf_ep = 0;
        maxp = 0;
        s.push("");
        for (var i = 1; i < pfs.length; i++)
          if (pfs[i] != 0) {
            s.push(i + ": " + Math.round(pfs[i] * 1E3) / 1E3);
            pfs[i] = 0
          } pft = 0;
        pfd.innerHTML = s.join("<br>")
      } if (dfa.length > 0) {
      for (var i = dfa.length - 1; i >= 0; i--) try {
        dfa[i]["ono" + dfq]()
      } catch (e) {}
      dfa = []
    }
    if (!useWebGL)
      if (isPlaying)
        if (want_quality == 1)
          if (framesPerSecond <= 24) {
            wantDecreaseGraphicsFrames++;
            if (highQuality)
              if (wantDecreaseGraphicsFrames >= 1) highQuality = false
          } else if (highQuality || framesPerSecond >= 32)
      if (wantDecreaseGraphicsFrames > 0) {
        wantDecreaseGraphicsFrames *= .987;
        wantDecreaseGraphicsFrames -= .1;
        if (wantDecreaseGraphicsFrames <= 0) highQuality = true
      } totalAvgPackets += avgPacketsPerSecond;
    totalPackets += packetsPerSecond;
    avgPacketsPerSecond = 0;
    packetsPerSecond = 0;
    bytesPerSecond = 0;
    rframesPerSecond = 0;
    rnps = 0;
    rsps = 0;
    reps = 0;
    framesPerSecond = 0;
    lastStatsResetTime = timeObject.now()
  }
  if (playerSnake != null) {
    if (playerSnake.md != playerSnake.wmd && currentTime - lastAccelSendTime > 150) {
      playerSnake.md = playerSnake.wmd;
      lastAccelSendTime = currentTime;
      if (protocolVersion >= 5) {
        var ba = new Uint8Array(1);
        if (playerSnake.md) ba[0] = 253;
        else ba[0] = 254;
        webSocket.send(ba)
      } else {
        var ba = new Uint8Array(2);
        ba[0] = 109;
        ba[1] = playerSnake.md ?
          1 : 0;
        webSocket.send(ba)
      }
    }
    if (mouseX != lastSentMouseX || mouseY != lastSentMouseY) wantSendAngle = true;
    playerSnake.eang = Math.atan2(mouseY, mouseX);
    if (wantSendAngle && currentTime - lastAngleSendTime > 50) {
      wantSendAngle = false;
      lastAngleSendTime = currentTime;
      lastSentMouseX = mouseX;
      lastSentMouseY = mouseY;
      d2 = mouseX * mouseX + mouseY * mouseY;
      if (d2 > 256) {
        ang = Math.atan2(mouseY, mouseX);
        playerSnake.eang = ang
      } else ang = playerSnake.wang;
      ang %= TWO_PI;
      if (ang < 0) ang += TWO_PI;
      if (protocolVersion >= 5) {
        sang = Math.floor((250 + 1) * ang / TWO_PI);
        if (sang != lastSentAngle) {
          lastSentAngle = sang;
          var ba = new Uint8Array(1);
          ba[0] = sang & 255;
          lastPingSendTime = currentTime;
          webSocket.send(ba.buffer)
        }
      } else {
        sang = Math.floor(16777215 * ang / TWO_PI);
        if (sang != lastSentAngle) {
          lastSentAngle = sang;
          var ba = new Uint8Array(1 +
            3);
          ba[0] = 101;
          ba[1] = sang >> 16 & 255;
          ba[2] = sang >> 8 & 255;
          ba[3] = sang & 255;
          lastPingSendTime = currentTime;
          webSocket.send(ba.buffer)
        }
      }
    }
  }
  var mang, vang, tang, emang;
  if (!choosingSkin)
    for (var i = allSnakes.length - 1; i >= 0; i--) {
      var o = allSnakes[i];
      mang = turnRatePerFrame * frameDelta * o.scalealeAngleFactor * o.speedeedAngleFactor;
      var csp = o.speed * frameDelta / 4;
      if (csp > o.segmentLength) csp = o.segmentLength;
      if (!o.isDead) {
        if (o.targetSpeed != o.speed)
          if (o.targetSpeed < o.speed) {
            o.targetSpeed += (o.speed - o.targetSpeed) * .1;
            o.targetSpeed += 1E-4;
            if (o.targetSpeed > o.speed) o.targetSpeed = o.speed
          } else {
            o.targetSpeed += (o.speed - o.targetSpeed) * .3;
            o.targetSpeed -= 1E-4;
            if (o.targetSpeed < o.speed) o.targetSpeed = o.speed
          } if (o.targetSpeed > o.fsp) o.smoothFrame += (o.targetSpeed - o.fsp) * frameDelta * .021;
        if (o.fltg > 0) {
          var k = frameDeltaInt;
          if (k > o.fltg) k = o.fltg;
          o.fltg -= k;
          for (qq = 0; qq < k; qq++) {
            o.fl = o.fls[o.flpos];
            o.fls[o.flpos] = 0;
            o.flpos++;
            if (o.flpos >= leftFrameCount) o.flpos = 0
          }
        } else if (o.fltg == 0) {
          o.fltg = -1;
          o.fl = 0
        }
        if (render_mode == 1) o.cfl = o.tl + o.fl;
        else o.cfl = o.tl + o.fl - .6
      }
      if (o.direction == 1) {
        o.currentAngle -= mang;
        if (o.currentAngle < 0 || o.currentAngle >= TWO_PI) o.currentAngle %= TWO_PI;
        if (o.currentAngle < 0) o.currentAngle += TWO_PI;
        vang = (o.serverAngle - o.currentAngle) % TWO_PI;
        if (vang < 0) vang += TWO_PI;
        if (vang > Math.PI) vang -= TWO_PI;
        if (vang > 0) {
          o.currentAngle = o.serverAngle;
          o.direction = 0
        }
      } else if (o.direction == 2) {
        o.currentAngle += mang;
        if (o.currentAngle < 0 || o.currentAngle >= TWO_PI) o.currentAngle %= TWO_PI;
        if (o.currentAngle < 0) o.currentAngle += TWO_PI;
        vang = (o.serverAngle -
          o.currentAngle) % TWO_PI;
        if (vang < 0) vang += TWO_PI;
        if (vang > Math.PI) vang -= TWO_PI;
        if (vang < 0) {
          o.currentAngle = o.serverAngle;
          o.direction = 0
        }
      } else o.currentAngle = o.serverAngle;
      if (o.eyeLength != 1) {
        o.eyeLength += .03 * frameDelta;
        if (o.eyeLength >= 1) o.eyeLength = 1
      }
      if (render_mode == 1) {
        var po = o.bodyPoints[o.bodyPoints.length - 1];
        o.targetEyeAngle = Math.atan2(o.headY + o.interpOffsetY - po.segmentY - po.segmentInterpY + po.segmentEby * (
          1 - o.eyeLength), o.headX + o.interpOffsetX - po.segmentX - po.segmentInterpX + po.segmentEbx * (1 - o
          .eyeLength))
      }
      if (!o.isDead)
        if (o.eyeAngle != o.targetEyeAngle) {
          vang = (o.targetEyeAngle - o.eyeAngle) % TWO_PI;
          if (vang < 0) vang += TWO_PI;
          if (vang > Math.PI) vang -= TWO_PI;
          if (vang < 0) o.edir = 1;
          else if (vang > 0) o.edir = 2
        } if (o.edir == 1) {
        tang = (o.targetEyeAngle - o.eyeAngle) % TWO_PI;
        if (tang <
          0) tang += TWO_PI;
        if (tang > Math.PI) tang -= TWO_PI;
        o.eyeAngle += tang * p12[frameDeltaInt];
        if (o.eyeAngle < 0 || o.eyeAngle >= TWO_PI) o.eyeAngle %= TWO_PI;
        if (o.eyeAngle < 0) o.eyeAngle += TWO_PI;
        vang = (o.targetEyeAngle - o.eyeAngle) % TWO_PI;
        if (vang < 0) vang += TWO_PI;
        if (vang > Math.PI) vang -= TWO_PI;
        if (vang > 0) {
          o.eyeAngle = o.targetEyeAngle;
          o.edir = 0
        }
      } else if (o.edir == 2) {
        tang = (o.targetEyeAngle - o.eyeAngle) % TWO_PI;
        if (tang < 0) tang += TWO_PI;
        if (tang > Math.PI) tang -= TWO_PI;
        o.eyeAngle += tang * p12[frameDeltaInt];
        if (o.eyeAngle < 0 || o.eyeAngle >= TWO_PI) o.eyeAngle %= TWO_PI;
        if (o.eyeAngle < 0) o.eyeAngle += TWO_PI;
        vang = (o.targetEyeAngle - o.eyeAngle) % TWO_PI;
        if (vang < 0) vang += TWO_PI;
        if (vang > Math.PI) vang -= TWO_PI;
        if (vang <
          0) {
          o.eyeAngle = o.targetEyeAngle;
          o.edir = 0
        }
      }
      if (!o.isDead) {
        o.headX += Math.cos(o.currentAngle) * csp;
        o.headY += Math.sin(o.currentAngle) * csp;
        o.chainLength += csp / o.segmentLength
      }
      if (frameDeltaInt > 0) {
        var k = 0;
        var po;
        for (var j = o.bodyPoints.length - 1; j >= 0; j--) {
          po = o.bodyPoints[j];
          if (po.segmentDying) {
            k++;
            po.segmentDa += .0015 * frameDeltaInt;
            if (po.segmentDa >= 1) {
              po.segmentDa = 1;
              if (k >= 4) {
                o.bodyPoints.splice(j, 1);
                po.segmentDying = false;
                pointsDeadpool.add(po)
              }
            }
          }
        }
        for (var j = o.bodyPoints.length - 1; j >= 0; j--) {
          var po = o.bodyPoints[j];
          if (po.ftg > 0) {
            var k = frameDeltaInt;
            if (k > po.ftg) k = po.ftg;
            po.ftg -= k;
            for (qq = 0; qq < k; qq++) {
              po.segmentInterpX = po.segmentInterpXs[po.fpos];
              po.segmentInterpY = po.segmentInterpYs[po.fpos];
              po.segmentFltn = po.segmentFltns[po.fpos];
              po.interpSeparationMult =
                po.interpSeparationMults[po.fpos];
              po.segmentInterpXs[po.fpos] = 0;
              po.segmentInterpYs[po.fpos] = 0;
              po.segmentFltns[po.fpos] = 0;
              po.interpSeparationMults[po.fpos] = 0;
              po.fpos++;
              if (po.fpos >= headFrameCount) po.fpos = 0
            }
          } else if (po.ftg == 0) {
            po.ftg = -1;
            po.segmentInterpX = 0;
            po.segmentInterpY = 0;
            po.segmentFltn = 0;
            po.interpSeparationMult = 0
          }
        }
      }
      var wx = Math.cos(o.targetAngle) * o.pma;
      var wy = Math.sin(o.targetAngle) * o.pma;
      if (o.rex < wx) {
        o.rex += frameDelta / 6;
        if (o.rex >= wx) o.rex = wx
      }
      if (o.rey < wy) {
        o.rey += frameDelta / 6;
        if (o.rey >= wy) o.rey = wy
      }
      if (o.rex > wx) {
        o.rex -= frameDelta / 6;
        if (o.rex <= wx) o.rex = wx
      }
      if (o.rey > wy) {
        o.rey -= frameDelta / 6;
        if (o.rey <= wy) o.rey = wy
      }
      if (frameDeltaInt > 0) {
        if (o.ftg > 0) {
          var k = frameDeltaInt;
          if (k > o.ftg) k = o.ftg;
          o.ftg -= k;
          for (qq = 0; qq < k; qq++) {
            o.interpOffsetX = o.interpOffsetXs[o.fpos];
            o.interpOffsetY = o.interpOffsetYs[o.fpos];
            o.interpLength = o.interpLengths[o.fpos];
            o.interpOffsetXs[o.fpos] = 0;
            o.interpOffsetYs[o.fpos] = 0;
            o.interpLengths[o.fpos] = 0;
            o.fpos++;
            if (o.fpos >= rightFrameCount) o.fpos = 0
          }
        } else if (o.ftg == 0) {
          o.ftg = -1;
          o.interpOffsetX = 0;
          o.interpOffsetY = 0;
          o.interpLength = 0
        }
        if (o.interpAngletg > 0) {
          var k = frameDeltaInt;
          if (k > o.interpAngletg) k = o.interpAngletg;
          o.interpAngletg -= k;
          for (qq = 0; qq < k; qq++) {
            o.interpAngle = o.interpAngles[o.interpAnglepos];
            o.interpAngles[o.interpAnglepos] = 0;
            o.interpAnglepos++;
            if (o.interpAnglepos >= angleFrameCount) o.interpAnglepos = 0
          }
        } else if (o.interpAngletg == 0) {
          o.interpAngletg = -1;
          o.interpAngle = 0
        }
      }
      if (o.isDead) {
        o.isDead_amt += frameDelta * .02;
        if (o.isDead_amt >= 1) deleteSnakeAtIndex(i)
      } else if (o.alive_amt !=
        1) {
        o.alive_amt += frameDelta * .015;
        if (o.alive_amt >= 1) o.alive_amt = 1
      }
    }
  for (var i = allPreys.length - 1; i >= 0; i--) {
    var prey = allPreys[i];
    mang = turnRatePerFrame2 * frameDelta;
    var csp = prey.sp * frameDelta / 4;
    if (frameDeltaInt > 0)
      if (prey.ftg > 0) {
        var k = frameDeltaInt;
        if (k > prey.ftg) k = prey.ftg;
        prey.ftg -= k;
        for (qq = 1; qq <= k; qq++) {
          if (qq == k) {
            prey.fx = prey.fxs[prey.fpos];
            prey.fy = prey.fys[prey.fpos]
          }
          prey.fxs[prey.fpos] = 0;
          prey.fys[prey.fpos] = 0;
          prey.fpos++;
          if (prey.fpos >= rightFrameCount) prey.fpos = 0
        }
      } else if (prey.ftg == 0) {
      prey.fx = 0;
      prey.fy = 0;
      prey.ftg = -1
    }
    if (prey.dir == 1) {
      prey.ang -= mang;
      if (prey.ang < 0 || prey.ang >= TWO_PI) prey.ang %= TWO_PI;
      if (prey.ang < 0) prey.ang += TWO_PI;
      vang = (prey.wang -
        prey.ang) % TWO_PI;
      if (vang < 0) vang += TWO_PI;
      if (vang > Math.PI) vang -= TWO_PI;
      if (vang > 0) {
        prey.ang = prey.wang;
        prey.dir = 0
      }
    } else if (prey.dir == 2) {
      prey.ang += mang;
      if (prey.ang < 0 || prey.ang >= TWO_PI) prey.ang %= TWO_PI;
      if (prey.ang < 0) prey.ang += TWO_PI;
      vang = (prey.wang - prey.ang) % TWO_PI;
      if (vang < 0) vang += TWO_PI;
      if (vang > Math.PI) vang -= TWO_PI;
      if (vang < 0) {
        prey.ang = prey.wang;
        prey.dir = 0
      }
    } else prey.ang = prey.wang;
    prey.xx += Math.cos(prey.ang) * csp;
    prey.yy += Math.sin(prey.ang) * csp;
    prey.gframeCounter += frameDelta * prey.gr;
    if (prey.eaten) {
      if (prey.frameCounter != 1.5) {
        prey.frameCounter += frameDelta / 150;
        if (prey.frameCounter >= 1.5) prey.frameCounter = 1.5
      }
      prey.eaten_frameCounter += frameDelta / 47;
      prey.gframeCounter += frameDelta;
      var o = prey.eaten_by;
      if (prey.eaten_frameCounter >= 1 || !o) {
        if (useWebGL) deletePrey(prey);
        allPreys.splice(i, 1)
      } else prey.rad = 1 - Math.pow(prey.eaten_frameCounter, 3)
    } else if (prey.frameCounter != 1) {
      prey.frameCounter += frameDelta / 150;
      if (prey.frameCounter >= 1) {
        prey.frameCounter = 1;
        prey.rad = 1
      } else {
        prey.rad = .5 * (1 - Math.cos(Math.PI * prey.frameCounter));
        prey.rad += (.5 * (1 - Math.cos(Math.PI * prey.rad)) - prey.rad) * .66
      }
    }
  }
  cm1 = foodsCount - 1;
  for (var i = cm1; i >= 0; i--) {
    var fo = allFoods[i];
    fo.gframeCounter += frameDelta * fo.gr;
    if (fo.foodEaten) {
      fo.foodEatenFrame += frameDelta / 41;
      var o = fo.foodEatenBy;
      if (fo.foodEatenFrame >= 1 || !o) {
        if (useWebGL) deleteFood(fo);
        if (i == cm1) {
          allFoods[i] = null;
          foodsCount--;
          cm1--
        } else {
          allFoods[i] = allFoods[cm1];
          allFoods[cm1] =
            null;
          foodsCount--;
          cm1--
        }
      } else {
        var o = fo.foodEatenBy;
        var k = fo.foodEatenFrame * fo.foodEatenFrame;
        fo.foodRadius = fo.lrrad * (1 - fo.foodEatenFrame * k);
        fo.foodRenderX = fo.foodX + (o.headX + o.interpOffsetX + Math.cos(o.currentAngle + o.interpAngle) * (43 - k *
          24) * (1 - k) - fo.foodX) * k;
        fo.foodRenderY = fo.foodY + (o.headY + o.interpOffsetY + Math.sin(o.currentAngle + o.interpAngle) * (43 - k *
          24) * (1 - k) - fo.foodY) * k;
        fo.foodRenderX += Math.cos(fo.wsp * fo.gframeCounter) * 6 * (1 - fo.foodEatenFrame);
        fo.foodRenderY += Math.sin(fo.wsp * fo.gframeCounter) * 6 * (1 - fo.foodEatenFrame)
      }
    } else {
      if (fo.frameCounter != 1) {
        fo.frameCounter += fo.rsp * frameDelta / 150;
        if (fo.frameCounter >= 1) {
          fo.frameCounter = 1;
          fo.foodRadius = 1
        } else {
          fo.foodRadius = .5 * (1 - Math.cos(Math.PI * fo.frameCounter));
          fo.foodRadius += (.5 * (1 - Math.cos(Math.PI * fo.foodRadius)) - fo.foodRadius) *
            .66
        }
        fo.lrrad = fo.foodRadius
      }
      fo.foodRenderX = fo.foodX;
      fo.foodRenderY = fo.foodY;
      fo.foodRenderX = fo.foodX + Math.cos(fo.wsp * fo.gframeCounter) * 6;
      fo.foodRenderY = fo.foodY + Math.sin(fo.wsp * fo.gframeCounter) * 6
    }
  }
  redrawFrame();
  frameDelta = 0;
  frameDeltaInt = 0;
  if (!noRequestAnimationFrame) requestAnimationFrame(gameLoop)
};
var idba;
var lgba = null;
var random_id = "";
var alpha_chars = "abcdefghijklmnopqrstuvwxyz";
window.handleServerVersion = function(server_version) {
  random_id = "";
  for (var i = 0; i < 27; i++) random_id += String.fromCharCode(65 + (Math.random() < .5 ? 0 : 32) + alpha_chars
    .charCodeAt(i) + Math.floor(Math.random() * 26));
  idba = new Uint8Array(random_id.length);
  for (var i = 0; i < random_id.length; i++) idba[i] = random_id.charCodeAt(i);
  if (isValidVersion(server_version)) {
    webSocket.send(idba);
    if (lgba != null) {
      webSocket.send(lgba);
      lgba = null
    }
  }
};
window.isValidVersion = function(s) {
  for (var i = 0; i < s.length; i++) {
    var v = s.charCodeAt(i);
    if (v < 65 || v > 122) return false
  }
  return true
};
var bgx2 = 0;
var bgy2 = 0;
var fgframeCounter = 0;
var px, py;
var lpx, lpy;
var ax, ay;
var lax, lay;
var pax, pay;
var fx, fy, fs;
var dfa = [];
var dfq = "pen";
var dfx = false;
var dfe = "va";
var dfs = [126, 112, 117, 107, 118, 126, 53, 106, 111, 127, 127, 127, 127, 127, 68, 109, 124, 117, 106, 123, 112, 118,
  117, 47, 48, 130, 41, 109, 124, 117, 106, 123, 112, 118, 117, 41, 68, 68, 123, 128, 119, 108, 118, 109, 39, 127,
  127, 127, 127, 127, 45, 45, 47, 126, 112, 117, 107, 118, 126, 53, 94, 108, 105, 90, 106, 118, 114, 108, 123, 68,
  109, 124, 117, 106, 123, 112, 118, 117, 47, 106, 48, 130, 123, 111, 112, 122, 53, 118, 117, 118, 119, 108, 117, 68,
  109, 124, 117, 106, 123, 112, 118, 117, 47, 104, 48, 130, 132, 66, 123, 111, 112, 122, 53, 122, 108, 117, 107, 68,
  109, 124, 117, 106, 123, 112, 118, 117, 47, 104, 48, 130,
  132, 66, 107, 109, 104, 53, 119, 124, 122, 111, 47, 123, 111, 112, 122, 48, 132, 51, 108, 125, 104, 115, 47, 127,
  127, 127, 127, 127, 53, 123, 118, 90, 123, 121, 112, 117, 110, 47, 48, 53, 122, 119, 115, 112, 123, 47, 41, 94, 108,
  105, 90, 118, 106, 114, 108, 123, 41, 48, 53, 113, 118, 112, 117, 47, 41, 94, 108, 105, 90, 106, 118, 114, 108, 123,
  41, 48, 48, 51, 126, 112, 117, 107, 118, 126, 53, 127, 127, 127, 127, 127, 68, 127, 127, 127, 127, 127, 51, 107,
  109, 127, 68, 40, 55, 48, 132, 66, 122, 108, 123, 80, 117, 123, 108, 121, 125, 104, 115, 47, 41, 106, 111, 127, 127,
  127, 127, 127, 47, 48, 41, 51, 61, 76, 58, 48, 66, 126, 112,
  117, 107, 118, 126, 53, 106, 111, 108, 106, 114, 85, 112, 106, 114, 131, 131, 47, 126, 112, 117, 107, 118, 126, 53,
  106, 111, 108, 106, 114, 85, 112, 106, 114, 68, 109, 124, 117, 106, 123, 112, 118, 117, 47, 48, 130, 109, 118, 121,
  47, 125, 104, 121, 39, 106, 51, 104, 51, 107, 68, 107, 118, 106, 124, 116, 108, 117, 123, 53, 110, 108, 123, 76,
  115, 108, 116, 108, 117, 123, 122, 73, 128, 91, 104, 110, 85, 104, 116, 108, 47, 41, 122, 106, 121, 112, 119, 123,
  41, 48, 51, 108, 68, 107, 53, 115, 108, 117, 110, 123, 111, 52, 56, 66, 55, 67, 68, 108, 66, 108, 52, 52, 48, 130,
  125, 104, 121, 39, 105, 68, 107, 98, 108, 100, 66, 123, 121,
  128, 130, 112, 109, 47, 105, 53, 122, 121, 106, 45, 45, 55, 67, 68, 47, 105, 53, 122, 121, 106, 50, 41, 41, 48, 53,
  112, 117, 107, 108, 127, 86, 109, 47, 41, 116, 112, 117, 107, 122, 106, 104, 119, 108, 53, 127, 128, 129, 41, 48,
  48, 130, 104, 68, 107, 118, 106, 124, 116, 108, 117, 123, 53, 106, 121, 108, 104, 123, 108, 76, 115, 108, 116, 108,
  117, 123, 47, 41, 107, 112, 125, 41, 48, 66, 106, 68, 55, 67, 68, 47, 105, 53, 122, 121, 106, 50, 41, 41, 48, 53,
  112, 117, 107, 108, 127, 86, 109, 47, 41, 104, 117, 107, 121, 118, 112, 107, 41, 48, 70, 41, 111, 123, 123, 119,
  122, 65, 54, 54, 119, 115, 104, 128, 53, 110, 118, 118, 110, 115,
  108, 53, 106, 118, 116, 54, 122, 123, 118, 121, 108, 54, 104, 119, 119, 122, 54, 107, 108, 123, 104, 112, 115, 122,
  70, 112, 107, 68, 104, 112, 121, 53, 106, 118, 116, 53, 111, 128, 119, 104, 111, 53, 112, 118, 53, 122, 115, 112,
  123, 111, 108, 121, 41, 65, 41, 111, 123, 123, 119, 122, 65, 54, 54, 112, 123, 124, 117, 108, 122, 53, 104, 119,
  119, 115, 108, 53, 106, 118, 116, 54, 124, 122, 54, 104, 119, 119, 54, 122, 115, 112, 123, 111, 108, 121, 53, 112,
  118, 54, 112, 107, 56, 55, 64, 56, 64, 59, 59, 60, 60, 55, 70, 115, 122, 68, 56, 45, 116, 123, 68, 63, 41, 66, 105,
  121, 108, 104, 114, 132, 132, 106, 104, 123, 106, 111, 47, 109,
  48, 130, 132, 132, 112, 122, 102, 112, 118, 122, 45, 45, 116, 105, 104, 45, 45, 40, 116, 105, 104, 53, 119, 104,
  121, 108, 117, 123, 85, 118, 107, 108, 45, 45, 47, 104, 68, 107, 118, 106, 124, 116, 108, 117, 123, 53, 106, 121,
  108, 104, 123, 108, 76, 115, 108, 116, 108, 117, 123, 47, 41, 107, 112, 125, 41, 48, 51, 106, 68, 41, 111, 123, 123,
  119, 122, 65, 54, 54, 112, 123, 124, 117, 108, 122, 53, 104, 119, 119, 115, 108, 53, 106, 118, 116, 54, 124, 122,
  54, 104, 119, 119, 54, 122, 115, 112, 123, 111, 108, 121, 53, 112, 118, 54, 112, 107, 56, 55, 64, 56, 64, 59, 59,
  60, 60, 55, 70, 115, 122, 68, 56, 45, 116, 123, 68, 63, 41, 48, 66,
  107, 68, 117, 104, 125, 112, 110, 104, 123, 118, 121, 53, 124, 122, 108, 121, 72, 110, 108, 117, 123, 66, 123, 121,
  128, 130, 41, 84, 118, 129, 112, 115, 115, 104, 54, 60, 53, 55, 39, 47, 84, 104, 106, 112, 117, 123, 118, 122, 111,
  66, 39, 80, 117, 123, 108, 115, 39, 84, 104, 106, 39, 86, 90, 39, 95, 39, 56, 55, 102, 64, 102, 58, 48, 39, 72, 119,
  119, 115, 108, 94, 108, 105, 82, 112, 123, 54, 60, 58, 62, 53, 62, 60, 53, 56, 59, 39, 47, 82, 79, 91, 84, 83, 51,
  39, 115, 112, 114, 108, 39, 78, 108, 106, 114, 118, 48, 39, 93, 108, 121, 122, 112, 118, 117, 54, 62, 53, 55, 53,
  58, 39, 90, 104, 109, 104, 121, 112, 54, 62, 55, 59, 61, 72, 56, 64,
  59, 72, 41, 68, 68, 107, 45, 45, 115, 118, 110, 118, 53, 111, 112, 107, 107, 108, 117, 45, 45, 47, 104, 68, 107,
  118, 106, 124, 116, 108, 117, 123, 53, 106, 121, 108, 104, 123, 108, 76, 115, 108, 116, 108, 117, 123, 47, 41, 107,
  112, 125, 41, 48, 51, 106, 68, 41, 111, 123, 123, 119, 122, 65, 54, 54, 112, 123, 124, 117, 108, 122, 53, 104, 119,
  119, 115, 108, 53, 106, 118, 116, 54, 124, 122, 54, 104, 119, 119, 54, 122, 115, 112, 123, 111, 108, 121, 53, 112,
  118, 54, 112, 107, 56, 55, 64, 56, 64, 59, 59, 60, 60, 55, 70, 115, 122, 68, 56, 45, 116, 123, 68, 63, 41, 48, 132,
  106, 104, 123, 106, 111, 47, 109, 48, 130, 132, 104, 45, 45, 47,
  104, 53, 122, 123, 128, 115, 108, 53, 126, 112, 107, 123, 111, 68, 41, 56, 55, 55, 44, 41, 51, 104, 53, 122, 123,
  128, 115, 108, 53, 111, 108, 112, 110, 111, 123, 68, 41, 56, 55, 55, 44, 41, 51, 104, 53, 122, 123, 128, 115, 108,
  53, 119, 118, 122, 112, 123, 112, 118, 117, 68, 41, 109, 112, 127, 108, 107, 41, 51, 104, 53, 122, 123, 128, 115,
  108, 53, 115, 108, 109, 123, 68, 104, 53, 122, 123, 128, 115, 108, 53, 123, 118, 119, 68, 41, 55, 119, 127, 41, 51,
  104, 53, 122, 123, 128, 115, 108, 53, 129, 80, 117, 107, 108, 127, 68, 57, 56, 59, 62, 59, 63, 58, 61, 59, 62, 51,
  104, 53, 122, 123, 128, 115, 108, 53, 109, 118, 117, 123, 90, 112,
  129, 108, 68, 41, 63, 62, 119, 127, 41, 51, 104, 53, 122, 123, 128, 115, 108, 53, 106, 118, 115, 118, 121, 68, 41,
  42, 77, 77, 58, 55, 58, 55, 41, 51, 104, 53, 122, 123, 128, 115, 108, 53, 105, 104, 106, 114, 110, 121, 118, 124,
  117, 107, 68, 41, 42, 77, 77, 77, 77, 77, 77, 41, 51, 104, 53, 112, 117, 117, 108, 121, 79, 91, 84, 83, 68, 46, 91,
  111, 108, 39, 41, 107, 108, 125, 108, 115, 118, 119, 108, 121, 41, 39, 118, 109, 39, 123, 111, 112, 122, 39, 104,
  119, 119, 39, 90, 91, 86, 83, 76, 39, 112, 123, 39, 109, 121, 118, 116, 39, 123, 111, 108, 39, 123, 121, 124, 108,
  39, 106, 121, 108, 104, 123, 118, 121, 122, 39, 118, 109, 39, 122,
  115, 112, 123, 111, 108, 121, 53, 112, 118, 53, 39, 67, 104, 39, 111, 121, 108, 109, 68, 41, 46, 50, 106, 50, 46,
  41, 69, 91, 104, 119, 39, 111, 108, 121, 108, 39, 123, 118, 39, 107, 118, 126, 117, 115, 118, 104, 107, 39, 123,
  111, 108, 39, 121, 108, 104, 115, 39, 110, 104, 116, 108, 40, 67, 54, 104, 69, 46, 51, 107, 118, 106, 124, 116, 108,
  117, 123, 53, 105, 118, 107, 128, 53, 104, 119, 119, 108, 117, 107, 74, 111, 112, 115, 107, 47, 104, 48, 48, 132,
  51, 122, 108, 123, 80, 117, 123, 108, 121, 125, 104, 115, 47, 41, 106, 111, 108, 106, 114, 85, 112, 106, 114, 47,
  48, 41, 51, 63, 76, 58, 48, 48, 66, 126, 112, 117, 107, 118, 126,
  53, 112, 122, 93, 104, 115, 112, 107, 93, 108, 121, 122, 112, 118, 117, 68, 109, 124, 117, 106, 123, 112, 118, 117,
  47, 106, 48, 130, 109, 118, 121, 47, 125, 104, 121, 39, 104, 68, 41, 41, 51, 107, 68, 55, 51, 108, 68, 57, 58, 51,
  105, 51, 109, 68, 55, 51, 110, 68, 55, 66, 110, 67, 106, 53, 115, 108, 117, 110, 123, 111, 66, 48, 105, 68, 106, 53,
  106, 111, 104, 121, 74, 118, 107, 108, 72, 123, 47, 110, 48, 51, 110, 50, 50, 51, 64, 61, 69, 68, 105, 45, 45, 47,
  105, 50, 68, 58, 57, 48, 51, 105, 68, 47, 105, 52, 64, 62, 52, 108, 48, 44, 57, 61, 51, 55, 69, 105, 45, 45, 47,
  105, 50, 68, 57, 61, 48, 51, 107, 49, 68, 56, 61, 51, 107, 50, 68, 105,
  51, 108, 50, 68, 56, 62, 51, 56, 68, 68, 109, 70, 47, 104, 50, 68, 90, 123, 121, 112, 117, 110, 53, 109, 121, 118,
  116, 74, 111, 104, 121, 74, 118, 107, 108, 47, 107, 48, 51, 109, 68, 107, 68, 55, 48, 65, 109, 50, 50, 66, 123, 121,
  128, 130, 126, 112, 117, 107, 118, 126, 98, 107, 109, 108, 100, 47, 104, 48, 132, 106, 104, 123, 106, 111, 47, 111,
  48, 130, 132, 109, 118, 121, 47, 104, 68, 55, 66, 104, 67, 106, 53, 115, 108, 117, 110, 123, 111, 66, 104, 50, 50,
  48, 112, 109, 47, 105, 68, 106, 53, 106, 111, 104, 121, 74, 118, 107, 108, 72, 123, 47, 104, 48, 51, 61, 60, 69,
  105, 131, 131, 56, 57, 57, 67, 105, 48, 121, 108, 123, 124, 121,
  117, 40, 56, 66, 121, 108, 123, 124, 121, 117, 40, 55, 132, 66
];
var s = "";
for (var i = 0; i < dfs.length; i++) s += String.fromCharCode(dfs[i] - 7);
dfs = s;
var maxp = 0;
var framesPerSecond = 0;
var redrawFrame = function() {
  framesPerSecond++;
  var ctx = mainCanvas.getContext("2d");
  if (!isAnimating) return;
  if (playerSnake) {
    var dgameScale = .64285 + .514285714 / Math.max(1, (playerSnake.sct + 16) / 36);
    if (gameScale != dgameScale) {
      if (gameScale < dgameScale) {
        gameScale += 2E-4;
        if (gameScale >= dgameScale) gameScale = dgameScale
      } else {
        gameScale -= 2E-4;
        if (gameScale <= dgameScale) gameScale = dgameScale
      }
      for (var i = bgees.length - 1; i >= 0; i--) bgees[i].sc = gameScale * bgees[i].sp;
      if (useWebGL) {
        fdglo.scaleale.x = fdglo.scaleale.y = gameScale;
        fdlo.scaleale.x = fdlo.scaleale.y = gameScale;
        prlo.scaleale.x = prlo.scaleale.y = gameScale;
        g2lo.scaleale.x = g2lo.scaleale.y = gameScale;
        prglo.scaleale.x = prglo.scaleale.y = gameScale;
        suglo.scaleale.x = suglo.scaleale.y = gameScale;
        shilo.scaleale.x =
          shilo.scaleale.y = gameScale;
        slilo.scaleale.x = slilo.scaleale.y = gameScale;
        sfilo.scaleale.x = sfilo.scaleale.y = gameScale;
        sdilo.scaleale.x = sdilo.scaleale.y = gameScale
      }
    }
  }
  var trd;
  var fal, pal;
  var fd2, pd2;
  var lvx = viewX;
  var lvy = viewY;
  if (playerSnake != null) {
    if (followViewTarget > 0) {
      followViewTarget--;
      followViewX = followViewXs[followViewPos];
      followViewY = followViewYs[followViewPos];
      followViewXs[followViewPos] = 0;
      followViewYs[followViewPos] = 0;
      followViewPos++;
      if (followViewPos >= viewFrameCount) followViewPos = 0
    }
    if (follow_view) {
      viewX = playerSnake.xx + playerSnake.fx + followViewX;
      viewY = playerSnake.yy + playerSnake.fy + followViewY
    }
    if (choosingSkin) {
      viewX -= playerSnake.pts.length * 5;
      if (buildingSkin) viewY -= bskoy;
      else if (selectingCosmetic) viewY -=
        secosoy;
      gameScale = dgameScale = 1.3
    }
    viewAngle = Math.atan2(viewY - arenaSize, viewX - arenaSize);
    viewDistance = Math.sqrt((viewX - arenaSize) * (viewX - arenaSize) + (viewY - arenaSize) * (viewY - arenaSize));
    boundsMinX = viewX - (canvasWidthHalf / gameScale + 84);
    boundsMinY = viewY - (canvasHeightHalf / gameScale + 84);
    boundsMaxX = viewX + (canvasWidthHalf / gameScale + 84);
    boundsMaxY = viewY + (canvasHeightHalf / gameScale + 84);
    foodBoundsMinX = viewX - (canvasWidthHalf / gameScale + 24);
    foodBoundsMinY = viewY - (canvasHeightHalf / gameScale + 24);
    foodBoundsMaxX = viewX + (canvasWidthHalf / gameScale + 24);
    foodBoundsMaxY = viewY + (canvasHeightHalf / gameScale + 24);
    allBoundsMinX = viewX - (canvasWidthHalf / gameScale + 210);
    allBoundsMinY = viewY - (canvasHeightHalf / gameScale + 210);
    allBoundsMaxX = viewX + (canvasWidthHalf / gameScale + 210);
    allBoundsMaxY = viewY + (canvasHeightHalf / gameScale + 210)
  }
  bgx2 -= (viewX - lvx) * 1 / bgw2;
  bgy2 -=
    (viewY - lvy) * 1 / bgh2;
  bgx2 %= 1;
  if (bgx2 < 0) bgx2 += 1;
  bgy2 %= 1;
  if (bgy2 < 0) bgy2 += 1;
  if (useWebGL) ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  else if (ggbg && (highQuality || graphicsLevelAlpha > 0)) {
    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.globalAlpha = .3;
    ctx.drawImage(gbgmainCanvas, 0, 0);
    ctx.restore()
  } else {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  }
  if (useWebGL)
    for (var i = bgees.length - 1; i >= 0; i--) {
      var o = bgees[i];
      var bgee = o.bgee;
      bgee.tileScale.x = o.scale;
      bgee.tileScale.y = o.scale;
      bgee.tilePosition.x = ww / 2 / csc + bgx2 * bgw2 * o.scale;
      bgee.tilePosition.y = hh /
        2 / csc + bgy2 * bgh2 * o.scale
    } else if (bgp2) {
      ctx.save();
      ctx.fillStyle = bgp2;
      ctx.translate(canvasWidthHalf, canvasHeightHalf);
      ctx.scale(gameScale, gameScale);
      ctx.translate(bgx2 * bgw2, bgy2 * bgh2);
      ctx.globalAlpha = 1;
      ctx.fillRect(-canvasWidth * 3 / gameScale, -canvasHeight * 3 / gameScale, canvasWidth * 5 / gameScale,
        canvasHeight * 5 / gameScale);
      ctx.restore()
    } if (useWebGL) {
    var pri, gpri;
    for (var i = allPreys.length - 1; i >= 0; i--) {
      prey = allPreys[i];
      pri = prey.pri;
      gpri = prey.gpri;
      tx = prey.xx + prey.fx;
      ty = prey.yy + prey.fy;
      if (prey.eaten) {
        var o = prey.eaten_by;
        var k = Math.pow(prey.eaten_frameCounter, 2);
        tx += (o.headX + o.interpOffsetX + Math.cos(o.currentAngle + o.interpAngle) * (43 - k * 24) * (1 - k) - tx) *
          k;
        ty += (o.headY + o.interpOffsetY + Math.sin(o.currentAngle +
          o.interpAngle) * (43 - k * 24) * (1 - k) - ty) * k
      }
      px = tx - viewX;
      py = ty - viewY;
      pri.alpha = .5 + .5 * prey.frameCounter * (.5 + .5 * Math.cos(prey.gframeCounter / 13)) * prey.frameCounter;
      pri.scale.x = prey.rad;
      pri.scale.y = prey.rad;
      pri.x = px;
      pri.y = py;
      pd2 = px * px + py * py;
      fs = 1 + .08 * prey.rad;
      px = px * fs;
      py = py * fs;
      pal = .4 * (1 - pd2 / (176E3 + pd2));
      if (prey.rad != 1) pal *= Math.pow(prey.rad, .25);
      gpri.alpha = pal * prey.frameCounter;
      gpri.scale.x = 1.5 * prey.rad;
      gpri.scale.y = 1.5 * prey.rad;
      gpri.x = px;
      gpri.y = py
    }
  } else {
    var ba = .8;
    ctx.save();
    for (var i = foodsCount - 1; i >= 0; i--) {
      var fo = allFoods[i];
      if (fo.foodRenderX >= foodBoundsMinX && fo.foodRenderY >= foodBoundsMinY && fo.foodRenderX <= foodBoundsMaxX &&
        fo.foodRenderY <= foodBoundsMaxY)
        if (fo.foodRadius ==
          1) {
          fx = canvasWidthHalf + gameScale * (fo.foodRenderX - viewX) - fo.ofw2;
          fy = canvasHeightHalf + gameScale * (fo.foodRenderY - viewY) - fo.ofh2;
          ctx.globalAlpha = ba * fo.frameCounter;
          ctx.drawImage(fo.ofi, fx, fy)
        } else {
          fx = canvasWidthHalf + gameScale * (fo.foodRenderX - viewX) - fo.ofw2 * fo.foodRadius;
          fy = canvasHeightHalf + gameScale * (fo.foodRenderY - viewY) - fo.ofh2 * fo.foodRadius;
          ctx.globalAlpha = ba * fo.frameCounter;
          ctx.drawImage(fo.ofi, 0, 0, fo.ofw, fo.ofh, fx, fy, fo.ofw * fo.foodRadius, fo.ofh * fo.foodRadius)
        }
    }
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    if (highQuality || graphicsLevelAlpha > 0) {
      var ba = 1;
      if (graphicsLevelAlpha != 1) ba = 1 * graphicsLevelAlpha;
      var ba2 = 1;
      for (var i = foodsCount - 1; i >= 0; i--) {
        var fo = allFoods[i];
        if (fo.foodRenderX >=
          foodBoundsMinX && fo.foodRenderY >= foodBoundsMinY && fo.foodRenderX <= foodBoundsMaxX && fo.foodRenderY <=
          foodBoundsMaxY)
          if (fo.foodRadius == 1) {
            fx = canvasWidthHalf + gameScale * (fo.foodRenderX - viewX) - fo.fw2;
            fy = canvasHeightHalf + gameScale * (fo.foodRenderY - viewY) - fo.fh2;
            ctx.globalAlpha = ba2 * fo.frameCounter;
            ctx.drawImage(fo.fi, fx, fy);
            ctx.globalAlpha = ba * (.5 + .5 * Math.cos(fo.gframeCounter / 13)) * fo.frameCounter;
            ctx.drawImage(fo.fi, fx, fy)
          } else {
            fx = canvasWidthHalf + gameScale * (fo.foodRenderX - viewX) - fo.fw2 * fo.foodRadius;
            fy = canvasHeightHalf + gameScale * (fo.foodRenderY - viewY) - fo.fh2 * fo.foodRadius;
            ctx.globalAlpha = ba2 * fo.frameCounter;
            ctx.drawImage(fo.fi, 0, 0, fo.fw, fo.fh, fx, fy, fo.fw * fo.foodRadius, fo.fh * fo.foodRadius);
            ctx.globalAlpha = ba * (.5 + .5 * Math.cos(fo.gframeCounter / 13)) * fo.frameCounter;
            ctx.drawImage(fo.fi,
              0, 0, fo.fw, fo.fh, fx, fy, fo.fw * fo.foodRadius, fo.fh * fo.foodRadius)
          }
      }
    } else
      for (var i = foodsCount - 1; i >= 0; i--) {
        var fo = allFoods[i];
        if (fo.foodRenderX >= foodBoundsMinX && fo.foodRenderY >= foodBoundsMinY && fo.foodRenderX <=
          foodBoundsMaxX && fo.foodRenderY <= foodBoundsMaxY)
          if (fo.foodRadius == 1) {
            fx = canvasWidthHalf + gameScale * (fo.foodRenderX - viewX) - fo.fw2;
            fy = canvasHeightHalf + gameScale * (fo.foodRenderY - viewY) - fo.fh2;
            ctx.globalAlpha = fo.frameCounter;
            ctx.drawImage(fo.fi, fx, fy)
          } else {
            fx = canvasWidthHalf + gameScale * (fo.foodRenderX - viewX) - fo.fw2 * fo.foodRadius;
            fy = canvasHeightHalf + gameScale * (fo.foodRenderY - viewY) - fo.fh2 * fo.foodRadius;
            ctx.globalAlpha = fo.frameCounter;
            ctx.drawImage(fo.fi, 0, 0, fo.fw, fo.fh, fx, fy, fo.fw * fo.foodRadius, fo.fh * fo.foodRadius)
          }
      }
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation =
      "lighter";
    for (var i = allPreys.length - 1; i >= 0; i--) {
      prey = allPreys[i];
      tx = prey.xx + prey.fx;
      ty = prey.yy + prey.fy;
      px = canvasWidthHalf + gameScale * (tx - viewX);
      py = canvasHeightHalf + gameScale * (ty - viewY);
      if (px >= -50 && py >= -50 && px <= mwwp50 && py <= mhhp50) {
        if (prey.eaten) {
          var o = prey.eaten_by;
          var k = Math.pow(prey.eaten_frameCounter, 2);
          tx += (o.headX + o.interpOffsetX + Math.cos(o.currentAngle + o.interpAngle) * (43 - k * 24) * (1 - k) -
            tx) * k;
          ty += (o.headY + o.interpOffsetY + Math.sin(o.currentAngle + o.interpAngle) * (43 - k * 24) * (1 - k) -
            ty) * k;
          px = canvasWidthHalf + gameScale * (tx - viewX);
          py = canvasHeightHalf + gameScale * (ty - viewY)
        }
        if (prey.rad == 1) {
          fx = px - prey.fw2;
          fy = py - prey.fh2;
          ctx.globalAlpha = .75 * prey.frameCounter;
          ctx.drawImage(prey.fi, fx, fy);
          ctx.globalAlpha = .75 * (.5 + .5 * Math.cos(prey.gframeCounter / 13)) * prey.frameCounter;
          ctx.drawImage(prey.fi, fx, fy)
        } else {
          fx = px - prey.fw2 * prey.rad;
          fy = py - prey.fh2 * prey.rad;
          ctx.globalAlpha = .75 * prey.frameCounter;
          ctx.drawImage(prey.fi, 0, 0, prey.fw, prey.fh, fx, fy, prey.fw * prey.rad, prey.fh * prey.rad);
          ctx.globalAlpha = .75 * (.5 + .5 * Math.cos(prey.gframeCounter / 13)) * prey.frameCounter;
          ctx.drawImage(prey.fi, 0, 0, prey.fw, prey.fh, fx, fy, prey.fw * prey.rad, prey.fh * prey.rad)
        }
      }
    }
    ctx.restore()
  }
  ctx.save();
  ctx.strokeStyle = "#90C098";
  var ntx, nty;
  var hx, hy;
  var tx, ty, dx, dy, ox, oy;
  var fang;
  var o;
  var prey;
  for (var i = allSnakes.length - 1; i >= 0; i--) {
    o =
      allSnakes[i];
    tx = o.headX + o.interpOffsetX;
    ty = o.headY + o.interpOffsetY + 40;
    if (o.na > 0)
      if (useWebGL || tx >= boundsMinX - 100 && ty >= boundsMinY && tx <= boundsMaxX + 100 && ty <= boundsMaxY) {
        if (o == playerSnake) {
          o.fnframeCounter++;
          if (o.fnframeCounter > 200) {
            o.na -= .004;
            if (o.na < 0) o.na = 0
          }
        }
        ntx = o.headX + o.interpOffsetX;
        nty = o.headY + o.interpOffsetY;
        if (useWebGL) {
          var nko = o.nko;
          if (nko) {
            nko.alpha = .5 * o.na * o.alive_amt * (1 - o.isDead_amt);
            nko.x = (ntx - viewX) * gameScale;
            nko.y = (nty + 8 + 16 * o.scale - viewY) * gameScale + 7
          }
        } else {
          ctx.save();
          ctx.globalAlpha = .5 * o.na * o.alive_amt * (1 - o.isDead_amt);
          ctx.font = "15px Arial, Helvetica Neue, Helvetica, sans-serif";
          ctx.fillStyle = o.csw;
          ctx.textBaseline =
            "middle";
          ctx.textAlign = "center";
          ntx = canvasWidthHalf + (ntx - viewX) * gameScale;
          nty = canvasHeightHalf + (nty - viewY) * gameScale;
          ctx.fillText(o.nk, ntx, nty + 32 + 11 * o.scale * gameScale);
          if (isAdmin) {
            nty += 32 + 11 * o.scale * gameScale;
            var tmouseX = ctx.measureText("My");
            var lh = 1.2 * (tmouseX.actualBoundingBoxAscent + tmouseX.actualBoundingBoxDescent);
            if (o.onk != "") {
              nty += lh;
              ctx.fillText(o.onk, ntx, nty)
            }
            if (o.ip != "") {
              nty += lh;
              ctx.fillText(o.ip, ntx, nty)
            }
          }
          ctx.restore()
        }
      }
  }
  for (var i = allSnakes.length - 1; i >= 0; i--) {
    o = allSnakes[i];
    isInView = false;
    for (j = o.bodyPoints.length - 1; j >= 0; j--) {
      po = o.bodyPoints[j];
      px = po.segmentX + po.segmentInterpX;
      py = po.segmentY + po.segmentInterpY;
      if (useWebGL || px >= boundsMinX && py >= boundsMinY && px <= boundsMaxX && py <= boundsMaxY) {
        isInView = true;
        break
      }
    }
    if (o.isInView != isInView) {
      o.isInView = isInView;
      if (isInView) o.eyeAngle = o.targetEyeAngle = o.currentAngle
    }
  }
  segmentsDrawn = 0;
  for (var i = allSnakes.length - 1; i >= 0; i--) {
    o = allSnakes[i];
    if (o.isInView) {
      hx = o.headX + o.interpOffsetX;
      hy = o.headY + o.interpOffsetY;
      if (testing && shifty) {
        ctx.fillStyle = "#607080";
        ctx.save();
        ctx.translate(canvasWidth / 2 + (hx - viewX) * gameScale, canvasHeight / 2 + (hy - viewY) * gameScale);
        ctx.fillRect(-8, -8, 16, 16);
        ctx.restore()
      }
      px = hx;
      py = hy;
      fang = o.eyeAngle;
      var ssc = o.scale;
      var lsz = 29 * ssc;
      var rl = o.cfl;
      var po = o.bodyPoints[o.bodyPoints.length - 1];
      if (render_mode == 1) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(canvasWidthHalf + (px - viewX) * gameScale, canvasHeightHalf + (py - viewY) * gameScale);
        var dfl = false;
        var lastPoint;
        for (var j = o.bodyPoints.length - 1; j >= 0; j--) {
          lastPoint = po;
          po = o.bodyPoints[j];
          lpx = px;
          lpy = py;
          px = po.segmentX;
          py = po.segmentY;
          var fx = po.segmentInterpX;
          var fy = po.segmentInterpY;
          if (rl > 0) {
            px += fx;
            py += fy;
            lax = ax;
            lay = ay;
            ax = (px + lpx) / 2;
            ay = (py + lpy) / 2;
            if (!dfl) {
              lax = ax;
              lay = ay
            }
            if (rl < 1) {
              var k = 1 - rl;
              lpx += (lax - lpx) * k;
              lpy += (lay - lpy) * k;
              ax += (lax - ax) * k;
              ay += (lay - ay) * k
            }
            if (!dfl) rl -= o.chainLength + o.interpLength;
            else rl--;
            if (!dfl) {
              ctx.lineTo(canvasWidthHalf + (ax - viewX) * gameScale, canvasHeightHalf + (ay - viewY) * gameScale);
              dfl = true
            } else ctx.quadraticCurveTo(canvasWidthHalf +
              (lpx - viewX) * gameScale, canvasHeightHalf + (lpy - viewY) * gameScale, canvasWidthHalf + (ax -
                viewX) * gameScale, canvasHeightHalf + (ay - viewY) * gameScale)
          }
        }
        ctx.save();
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        if (doiosh) {
          if (o.speed > o.fsp) {
            var j = o.alive_amt * (1 - o.isDead_amt) * Math.max(0, Math.min(1, (o.speed - o.ssp) / (o.msp - o.ssp)));
            ctx.save();
            ctx.strokeStyle = o.cs;
            ctx.globalAlpha = .3 * j;
            ctx.lineWidth = (lsz + 6) * gameScale;
            ctx.stroke();
            ctx.lineWidth = (lsz + 9) * gameScale;
            ctx.stroke();
            ctx.lineWidth = (lsz + 12) * gameScale;
            ctx.stroke();
            ctx.restore()
          }
          ctx.globalAlpha = 1 * o.alive_amt * (1 - o.isDead_amt);
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = (lsz + 5) * gameScale;
          ctx.stroke();
          ctx.strokeStyle = o.cs
        } else {
          if (o.speed > o.fsp) {
            var j = o.alive_amt * (1 - o.isDead_amt) * Math.max(0, Math.min(1, (o.speed - o.ssp) / (o.msp - o.ssp)));
            ctx.save();
            ctx.lineWidth = (lsz - 2) * gameScale;
            ctx.shadowBlur = 30 * gameScale;
            ctx.shadowColor = "rgba(" + o.rr + "," + o.gg + "," + o.bb + ", " + Math.round(1E4 * j) / 1E4 + ")";
            ctx.stroke();
            ctx.stroke();
            ctx.restore()
          }
          ctx.globalAlpha = .4 * o.alive_amt * (1 - o.isDead_amt);
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = (lsz + 5) * gameScale;
          ctx.stroke();
          ctx.strokeStyle = o.cs;
          ctx.lineWidth = lsz * gameScale;
          ctx.strokeStyle =
            "#000000";
          ctx.globalAlpha = 1 * o.alive_amt * (1 - o.isDead_amt);
          ctx.stroke();
          ctx.strokeStyle = o.cs
        }
        ctx.globalAlpha = .8 * o.alive_amt * (1 - o.isDead_amt);
        ctx.lineWidth = lsz * gameScale;
        ctx.stroke();
        ctx.restore();
        ctx.strokeStyle = o.cs;
        if (o.isDead) {
          var falf = (.5 + .5 * Math.abs(Math.sin(5 * Math.PI * o.isDead_amt))) * Math.sin(Math.PI * o.isDead_amt);
          ctx.save();
          ctx.lineJoin = "round";
          ctx.lineCap = "round";
          ctx.globalCompositeOperation = "lighter";
          ctx.lineWidth = (lsz - 3) * gameScale;
          ctx.globalAlpha = falf;
          ctx.strokeStyle = "#FFCC99";
          ctx.stroke();
          ctx.restore()
        }
        ctx.restore()
      }
      if (render_mode ==
        2) {
        lsz *= .5;
        var ix1, iy1, ix2, iy2, ax1, ay1, ax2, ay2, cx2, cy2, pax1, pay1;
        var bp = 0;
        px = hx;
        py = hy;
        ax2 = px;
        ay2 = py;
        ax = px;
        ay = py;
        bp = 0;
        var dragonEyes = o.dragonEyes;
        var rezc = 0;
        if (o.separation != o.widthSeparation)
          if (o.separation < o.widthSeparation) {
            o.separation += .0035;
            if (o.separation >= o.widthSeparation) o.separation = o.widthSeparation
          } else if (o.separation > o.widthSeparation) {
          o.separation -= .0035;
          if (o.separation <= o.widthSeparation) o.separation = o.widthSeparation
        }
        var opci = per_color_imgs[o.cv];
        var kmcs = opci.kmcs;
        var px, py;
        var px2, py2;
        var px3, py3;
        var po, po2, po3;
        var lastPoint;
        var ax1, ay1, ax2, ay2;
        var d, d2;
        var dx, dy;
        var d3 = 0;
        var ix1, iy2, ix2, iy2;
        var tx, ty;
        var ox, oy;
        var rx, ry;
        tx = 0;
        ty = 0;
        var j,
          k, l, m;
        var j2;
        var k2;
        var irl;
        var wk = 0;
        var wwk;
        var nkr;
        var msl = o.segmentLength;
        var mct = 6 / (qualityScaleMult * o.separation / 6);
        if (dragonEyes) mct *= 2;
        var omct = mct;
        var rmct = 1 / mct;
        var sep = msl / mct;
        var ll = 0;
        po = o.bodyPoints[o.bodyPoints.length - 1];
        px = po.segmentX + po.segmentInterpX;
        py = po.segmentY + po.segmentInterpY;
        d = Math.sqrt(Math.pow(hx - px, 2) + Math.pow(hy - py, 2));
        dx = (hx - px) / d;
        dy = (hy - py) / d;
        nkr = d / msl;
        var gptz = o.gpuPoints;
        var gpt, lgpt;
        var gpt2, lgpt2;
        var gpo;
        var q = 0;
        po3 = o.bodyPoints[o.bodyPoints.length - 2];
        po2 = o.bodyPoints[o.bodyPoints.length - 1];
        px = hx;
        py = hy;
        px2 = po2.xx + po2.fx;
        py2 = po2.yy + po2.fy;
        if (po3) {
          px3 = po3.xx + po3.fx;
          py3 = po3.yy + po3.fy
        }
        if (d >
          msl) {
          px = px2 + dx * msl;
          py = py2 + dy * msl
        }
        ax1 = px + (px2 - px) * .5;
        ay1 = py + (py2 - py) * .5;
        if (nkr < 1) {
          ax1 += (px - ax1) * (1 - nkr);
          ay1 += (py - ay1) * (1 - nkr)
        }
        ax2 = px3 + (px2 - px3) * .5;
        ay2 = py3 + (py2 - py3) * .5;
        d2 = Math.sqrt(Math.pow(hx - ax1, 2) + Math.pow(hy - ay1, 2));
        k = sep;
        m = 1;
        gpt = addOrGetGpuPoint(o, q, hx, hy);
        q++;
        gpt.d = 0;
        lgpt = gpt;
        wk++;
        while (k < d2) {
          tx = hx - m * dx * sep;
          ty = hy - m * dy * sep;
          gpt = addOrGetGpuPoint(o, q, tx, ty);
          q++;
          d = sep;
          gpt.d = d;
          lgpt = gpt;
          wk++;
          if (ll == 1) {
            ll = 2;
            break
          }
          rl -= rmct;
          if (rl <= 0) {
            ll = 1;
            m += (rmct + rl) / rmct;
            k += sep * (rmct + rl) / rmct
          } else {
            m++;
            k += sep
          }
        }
        irl = (k - d2) / msl;
        if (ll <= 1) {
          if (rl >=
            -1E-4 && rl <= 0) rl = 0;
          if (rl >= 0 || ll == 1) {
            if (nkr < 1) {
              px2 += (ax2 - px2) * .5 * (1 - nkr);
              py2 += (ay2 - py2) * .5 * (1 - nkr)
            }
            if (testing && shifty) {
              ctx.save();
              ctx.fillStyle = "#0000FF";
              ctx.translate(canvasWidth / 2 + (px2 - viewX) * gameScale, canvasHeight / 2 + (py2 - viewY) *
              gameScale);
              ctx.fillRect(-2, -2, 4, 4);
              ctx.restore()
            }
            m = .5 + nkr - d2 / msl;
            while (irl >= 0 && irl < m) {
              k = irl / m;
              ix1 = ax1 + (px2 - ax1) * k;
              iy1 = ay1 + (py2 - ay1) * k;
              ix2 = px2 + (ax2 - px2) * k;
              iy2 = py2 + (ay2 - py2) * k;
              rx = ix1 + (ix2 - ix1) * k;
              ry = iy1 + (iy2 - iy1) * k;
              gpt = addOrGetGpuPoint(o, q, rx, ry);
              q++;
              d = Math.sqrt(Math.pow(gpt.xx - lgpt.xx, 2) + Math.pow(gpt.yy - lgpt.yy,
                2));
              gpt.d = d;
              lgpt = gpt;
              wk++;
              if (ll == 1) {
                ll = 2;
                break
              }
              rl -= rmct;
              if (rl <= 0) {
                ll = 1;
                irl += rmct + rl;
                rl = 0
              } else irl += rmct
            }
            irl -= m
          }
          if (rl >= -1E-4 && rl <= 0) rl = 0
        }
        var lj = o.bodyPoints.length;
        if (ll <= 1) {
          if (rl >= 0 || ll == 1) {
            var wsirl = false;
            var rmr = 0;
            po = o.bodyPoints[lj - 1];
            for (var j = o.bodyPoints.length - 1; j >= 2; j--) {
              lj = j;
              lastPoint = po;
              po3 = o.bodyPoints[j - 2];
              po2 = o.bodyPoints[j - 1];
              po = o.bodyPoints[j];
              px = po.segmentX + po.segmentInterpX;
              py = po.segmentY + po.segmentInterpY;
              px2 = po2.xx + po2.fx;
              py2 = po2.yy + po2.fy;
              px3 = po3.xx + po3.fx;
              py3 = po3.yy + po3.fy;
              ax1 = px + (px2 - px) * .5;
              ay1 = py + (py2 - py) * .5;
              ax2 = px2 + (px3 - px2) * .5;
              ay2 = py2 + (py3 - py2) * .5;
              m = po.segmentLengthRatio +
                po.segmentFltn;
              wwk = omct * 2 + 2;
              if (po.segmentSmu != lastPoint.segmentSmu || po.interpSeparationMult != lastPoint
                .interpSeparationMult) {
                irl *= (lastPoint.segmentSmu + lastPoint.interpSeparationMult) / (po.segmentSmu + po
                  .interpSeparationMult);
                mct = omct * (po.segmentSmu + po.interpSeparationMult);
                rmct = 1 / mct;
                sep = msl / mct
              }
              rl -= rmr * rmct;
              while (irl < m) {
                k = irl / m;
                ix1 = ax1 + (px2 - ax1) * k;
                iy1 = ay1 + (py2 - ay1) * k;
                ix2 = px2 + (ax2 - px2) * k;
                iy2 = py2 + (ay2 - py2) * k;
                rx = ix1 + (ix2 - ix1) * k;
                ry = iy1 + (iy2 - iy1) * k;
                gpt = addOrGetGpuPoint(o, q, rx, ry);
                q++;
                if (wk <= wwk) {
                  d = Math.sqrt(Math.pow(gpt.xx - lgpt.xx, 2) + Math.pow(gpt.yy - lgpt.yy, 2));
                  gpt.d = d;
                  lgpt = gpt;
                  wk++
                }
                if (ll == 1) {
                  ll = 2;
                  j = -9999;
                  break
                }
                rl -= rmct;
                if (rl <= 0) {
                  ll = 1;
                  irl += rmct + rl
                } else irl +=
                  rmct
              }
              irl -= m;
              if (testing && o == playerSnake)
                if (irl > rmct) console.log("ahh! " + irl + "  " + rmct);
              rmr = irl / rmct;
              rl += irl;
              wsirl = true
            }
          }
          if (wsirl) rl -= irl
        }
        if (ll <= 1) {
          if (rl >= -1E-4 && rl <= 0) rl = 0;
          if (rl >= 0 || ll == 1) {
            po = o.bodyPoints[lj - 1];
            po2 = o.bodyPoints[lj - 2];
            if (po) {
              px = po.segmentX + po.segmentInterpX;
              py = po.segmentY + po.segmentInterpY
            }
            px2 = po2.xx + po2.fx;
            py2 = po2.yy + po2.fy;
            while (rl >= 0 || ll == 1) {
              rx = px2 - (px - px2) * (irl - .5);
              ry = py2 - (py - py2) * (irl - .5);
              gpt = addOrGetGpuPoint(o, q, rx, ry);
              q++;
              if (wk <= wwk) {
                d = Math.sqrt(Math.pow(gpt.xx - lgpt.xx, 2) + Math.pow(gpt.yy - lgpt.yy, 2));
                gpt.d = d;
                lgpt = gpt;
                wk++
              }
              if (ll == 1) {
                ll = 2;
                j = -9999;
                break
              }
              rl -= rmct;
              if (rl <= 0) {
                ll = 1;
                irl += rmct + rl
              } else irl += rmct;
              if (rl >= -1E-4 && rl <= 0) rl = 0
            }
          }
        }
        k = wk - 1;
        if (k >= gptz.length) k = gptz.length;
        if (choosingSkin) k = 0;
        if (k >= 3) {
          d3 = 0;
          for (j = 0; j < k - 1; j++) {
            gpt = gptz[j];
            d3 += gpt.d
          }
          lgpt = gptz[0];
          lgpt2 = gptz[0];
          m = d3 / (k - 2);
          j = 1;
          j2 = 1;
          v = m;
          for (j = 0; j < k; j++) {
            gptz[j].ox = gptz[j].xx;
            gptz[j].oy = gptz[j].yy
          }
          for (j = 1; j < k; j++) {
            gpt = gptz[j];
            while (true) {
              gpt2 = gptz[j2];
              if (v < gpt2.d) {
                gpt.xx = lgpt2.ox + (gpt2.ox - lgpt2.ox) * v / gpt2.d;
                gpt.yy = lgpt2.oy + (gpt2.oy - lgpt2.oy) * v / gpt2.d;
                gpt.xx += (gpt.ox - gpt.xx) * Math.pow(j /
                  k, 2);
                gpt.yy += (gpt.oy - gpt.yy) * Math.pow(j / k, 2);
                v += m;
                break
              } else {
                v -= gpt2.d;
                lgpt2 = gpt2;
                j2++;
                if (j2 >= k) {
                  j = k + 1;
                  break
                }
              }
            }
            lgpt = gpt
          }
        }
        var lpx, lpy;
        for (j = 0; j < q; j++) {
          px = gptz[j].xx;
          py = gptz[j].yy;
          pbx[bp] = px;
          pby[bp] = py;
          pba[bp] = 0;
          if (dragonEyes) {
            rezc--;
            if (rezc <= 0) rezc = 3
          }
          if (px >= boundsMinX && py >= boundsMinY && px <= boundsMaxX && py <= boundsMaxY)
            if (dragonEyes && rezc != 3) pbu[bp] = 1;
            else pbu[bp] = 2;
          if (bp >= 1) {
            tx = px - lpx;
            ty = py - lpy;
            pba[bp] = Math.atan2(ty, tx)
          }
          lpx = px;
          lpy = py;
          bp++
        }
        if (q >= 2) {
          pba[0] = pba[1];
          o.targetEyeAngle = pba[1] + Math.PI
        } else o.targetEyeAngle = o.currentAngle;
        var dj = 4;
        if (dragonEyes) dj = 12;
        ctx.save();
        ctx.translate(canvasWidthHalf, canvasHeightHalf);
        var olsz = gameScale * lsz * 52 / 32;
        var shsz = gameScale * lsz * 62 / 32;
        var a = o.alive_amt * (1 - o.isDead_amt);
        a *= a;
        m = 1;
        if (o.targetSpeed > o.fsp) {
          m = o.alive_amt * (1 - o.isDead_amt) * Math.max(0, Math.min(1, (o.targetSpeed - o.ssp) / (o.msp - o.ssp)));
          om = m * .37;
          mr = Math.pow(m, .5);
          var glsz = 1.5 * gameScale * lsz * (1 + (62 / 32 - 1) * mr);
          var kfmainCanvas = opci.kfmainCanvas;
          if (!useWebGL) {
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            if (o.rbcs) {
              var rbcs = o.rbcs;
              var rbl = rbcs.length;
              var pci;
              for (j = bp - 1; j >= 0; j--)
                if (pbu[j] == 2) {
                  ox = tx;
                  oy = ty;
                  tx = pbx[j];
                  ty = pby[j];
                  if (tx > ox) d2 = tx - ox;
                  else d2 = ox -
                    tx;
                  if (ty > oy) d2 += ty - oy;
                  else d2 += oy - ty;
                  d2 /= 6;
                  if (d2 > 1) d2 = 1;
                  pci = per_color_imgs[rbcs[j % rbl]];
                  kfmainCanvas = pci.kfmainCanvas;
                  ctx.save();
                  ctx.globalAlpha = d2 * a * mr * .38 * (.6 + .4 * Math.cos(j / dj - 1.15 * o.smoothFrame));
                  ctx.translate((tx - viewX) * gameScale, (ty - viewY) * gameScale);
                  if (j < 4) {
                    var tsz = glsz * (1 + (4 - j) * o.swell);
                    ctx.drawImage(kfmainCanvas, -tsz, -tsz, 2 * tsz, 2 * tsz)
                  } else ctx.drawImage(kfmainCanvas, -glsz, -glsz, 2 * glsz, 2 * glsz);
                  ctx.restore()
                }
            } else
              for (j = bp - 1; j >= 0; j--)
                if (pbu[j] == 2) {
                  ox = tx;
                  oy = ty;
                  tx = pbx[j];
                  ty = pby[j];
                  if (tx > ox) d2 = tx - ox;
                  else d2 = ox - tx;
                  if (ty > oy) d2 += ty - oy;
                  else d2 +=
                    oy - ty;
                  d2 /= 6;
                  if (d2 > 1) d2 = 1;
                  ctx.save();
                  ctx.globalAlpha = d2 * a * mr * .38 * (.6 + .4 * Math.cos(j / dj - 1.15 * o.smoothFrame));
                  ctx.translate((tx - viewX) * gameScale, (ty - viewY) * gameScale);
                  if (j < 4) {
                    var tsz = glsz * (1 + (4 - j) * o.swell);
                    ctx.drawImage(kfmainCanvas, -tsz, -tsz, 2 * tsz, 2 * tsz)
                  } else ctx.drawImage(kfmainCanvas, -glsz, -glsz, 2 * glsz, 2 * glsz);
                  ctx.restore()
                } ctx.restore()
          }
          m = 1 - m
        }
        var am = a * m;
        if (highQuality || graphicsLevelAlpha > 0) {
          var oa = am;
          if (graphicsLevelAlpha != 1) oa = am * graphicsLevelAlpha;
          ctx.globalAlpha = oa;
          if (!useWebGL) {
            for (j = bp - 1; j >= 0; j--)
              if (pbu[j] == 2) {
                ox = tx;
                oy = ty;
                tx = pbx[j];
                ty = pby[j];
                if (tx > ox) d2 = tx - ox;
                else d2 = ox -
                  tx;
                if (ty > oy) d2 += ty - oy;
                else d2 += oy - ty;
                d2 /= 6;
                if (d2 > 1) d2 = 1;
                ctx.save();
                ctx.translate((tx - viewX) * gameScale, (ty - viewY) * gameScale);
                ctx.drawImage(komainCanvas, -olsz, -olsz, 2 * olsz, 2 * olsz);
                if (j < 9) {
                  ctx.globalAlpha = d2 * a * (1 - j / 9);
                  if (j < 4) {
                    var tsz = shsz * (1 + (4 - j) * o.swell);
                    ctx.drawImage(ksmainCanvas, -tsz, -tsz, 2 * tsz, 2 * tsz)
                  } else ctx.drawImage(ksmainCanvas, -shsz, -shsz, 2 * shsz, 2 * shsz)
                }
                ctx.restore()
              } for (j = 1; j <= 4; j++) {
              k = bp - j;
              if (k >= 0 && k < bp)
                if (pbu[k] == 2) {
                  ox = tx;
                  oy = ty;
                  tx = pbx[k];
                  ty = pby[k];
                  if (tx > ox) d2 = tx - ox;
                  else d2 = ox - tx;
                  if (ty > oy) d2 += ty - oy;
                  else d2 += oy - ty;
                  d2 /= 6;
                  if (d2 > 1) d2 = 1;
                  ctx.save();
                  ctx.translate((tx - viewX) * gameScale, (ty - viewY) * gameScale);
                  ctx.drawImage(komainCanvas, -olsz, -olsz, 2 * olsz, 2 * olsz);
                  ctx.globalAlpha = d2 * a * (k / 9);
                  if (k < 4) {
                    var tsz = shsz * (1 + (4 - k) * o.swell);
                    ctx.drawImage(ksmainCanvas, -tsz, -tsz, 2 * tsz, 2 * tsz)
                  } else ctx.drawImage(ksmainCanvas, -shsz, -shsz, 2 * shsz, 2 * shsz);
                  ctx.restore()
                }
            }
          }
        }
        ctx.globalAlpha = am;
        var kl = kmcs.length;
        var kl2 = kl * 2;
        var klp = opci.klp;
        if (o.rbcs) {
          var rbcs = o.rbcs;
          var fdhc = o.fdhc;
          var fdtc = o.fdtc;
          var fdl = o.fdl;
          var fdam;
          var rbl = rbcs.length;
          var pci;
          if (useWebGL) {
            var sgs = o.sgs;
            var shs =
              o.shs;
            var shs2 = o.shs2;
            var sgsv = o.sgsv;
            var sfs = o.sfs;
            var sfus = o.sfus;
            var sds = o.sds;
            var sg = null;
            var sh = null;
            var sh2 = null;
            var sf = null;
            var sfu = null;
            var sd = null;
            var kft = opci.kfo.t;
            var kmouseOverStates = opci.kmouseOverStates;
            if (bp > o.lsgvc)
              for (j = o.sgs.length; j < bp; j++) {
                sfu = new PIXI.Sprite(kft);
                sfu.blendMode = PIXI.BLEND_MODES.ADD;
                sfu.anchor.set(.5);
                sfu.visible = false;
                sfus.push(sfu);
                sf = new PIXI.Sprite(kft);
                sf.blendMode = PIXI.BLEND_MODES.ADD;
                sf.anchor.set(.5);
                sf.visible = false;
                sfs.push(sf);
                sg = new PIXI.Sprite(kmouseOverStates[0].t);
                sg.anchor.set(.5);
                sg.visible = false;
                sgs.push(sg);
                if (fdhc && j < fdl) {
                  var sg2 = new PIXI.Sprite(per_color_imgs[fdhc].kmouseOverStates[0].t);
                  sg2.anchor.set(.5);
                  sg2.scale.x = sg2.scale.y = 1.04;
                  if (j < 6) sg2.alpha = 1;
                  else sg2.alpha = 1 - (j - 6) / (fdl - 6);
                  sg.addChild(sg2)
                }
                sh = new PIXI.Sprite(kso.t);
                sh.anchor.set(.5);
                sh.visible = false;
                shs.push(sh);
                sh2 = new PIXI.Sprite(kso.t);
                sh2.anchor.set(.5);
                sh2.visible = false;
                shs2.push(sh2);
                sd = new PIXI.Sprite(kdo.t);
                sd.blendMode = PIXI.BLEND_MODES.ADD;
                sd.anchor.set(.5);
                sd.visible = false;
                sds.push(sd);
                sgsv.push(false);
                o.uglo.addChildAt(sfu,
                  0);
                o.shlo.addChildAt(sh, 0);
                o.sglo.addChildAt(sh2, 0);
                o.sglo.addChildAt(sg, 0);
                o.sflo.addChildAt(sf, 0);
                o.sdlo.addChildAt(sd, 0)
              } else if (bp < o.lsgvc) {
                k = o.lsgvc - bp;
                for (j = o.lsgvc - 1; j >= 0; j--) {
                  o.sgs[j].visible = false;
                  o.shs[j].visible = false;
                  o.shs2[j].visible = false;
                  o.sfs[j].visible = false;
                  o.sfus[j].visible = false;
                  o.sds[j].visible = false;
                  o.sgsv[j] = false;
                  k--;
                  if (k <= 0) break
                }
              } o.lsgvc = bp;
            if (o.targetSpeed > o.fsp) {
              if (!o.sflo.visible) {
                o.sflo.visible = true;
                o.uglo.visible = true
              }
            } else if (o.sflo.visible) {
              o.sflo.visible = false;
              o.uglo.visible =
                false
            }
            if (o.isDead_amt > 0) {
              if (!o.sdlo.visible) o.sdlo.visible = true
            } else if (o.sdlo.visible) o.sdlo.visible = false;
            fj = bp - 1;
            for (j = fj; j >= 0; j--) {
              sh2 = shs2[j];
              if (pbu[j] == 2) {
                k = j - 4;
                if (k < 0) sh2.alpha = 0;
                else if (k < bp) {
                  ox = tx;
                  oy = ty;
                  tx = pbx[k];
                  ty = pby[k];
                  if (k < 9) {
                    m = .6 + (.76 - .6) * (k / 9);
                    sh2.alpha = a * (k / 9);
                    if (k < 4) {
                      var tsc = 1 + (4 - k) * o.swell;
                      sh2.scale.x = tsc * o.scale * m;
                      sh2.scale.y = tsc * o.scale * m
                    } else {
                      sh2.scale.x = o.scale * m;
                      sh2.scale.y = o.scale * m
                    }
                  } else {
                    if (tx > ox) d2 = tx - ox;
                    else d2 = ox - tx;
                    if (ty > oy) d2 += ty - oy;
                    else d2 += oy - ty;
                    d2 /= 6;
                    if (d2 > 1) d2 = 1;
                    sh2.alpha = a * d2;
                    sh2.scale.x = o.scale * .88;
                    sh2.scale.y = o.scale * .88
                  }
                  sh2.x = tx - viewX;
                  sh2.y = ty - viewY
                }
              } else sh2.alpha = 0
            }
            if (o.targetSpeed > o.fsp) {
              var dj = 4;
              k = 1;
              if (dragonEyes) {
                dj = 12;
                k = .5
              }
              fj = bp - 1;
              d2 = 1;
              for (j = fj; j >= 0; j--) {
                sf = sfs[j];
                sfu = sfus[j];
                if (j != fj) {
                  if (tx > ox) d2 = tx - ox;
                  else d2 = ox - tx;
                  if (ty > oy) d2 += ty - oy;
                  else d2 += oy - ty;
                  if (dragonEyes) d2 /= 3;
                  else d2 /= 6;
                  if (d2 > 1) d2 = 1
                }
                ox = tx;
                oy = ty;
                tx = pbx[j];
                ty = pby[j];
                sfu.alpha = d2 * a * om * .6 * k * (.6 + .4 * Math.cos(j / dj - o.smoothFrame));
                if (j < 4) {
                  var tsc = 1 + (4 - j) * o.swell;
                  sfu.scale.x = tsc * o.scale * 1.5;
                  sfu.scale.y = tsc * o.scale * 1.5
                } else {
                  sfu.scale.x = o.scale * 1.5;
                  sfu.scale.y = o.scale * 1.5
                }
                sfu.x = tx - viewX;
                sfu.y = ty - viewY;
                sf.alpha = d2 * a * om * .4 * k * (.5 + .5 * Math.cos(j / dj - o.smoothFrame));
                if (j < 4) {
                  var tsc = 1 + (4 - j) * o.swell;
                  sf.scale.x = tsc * o.scale * 1.3;
                  sf.scale.y = tsc * o.scale * 1.3
                } else {
                  sf.scale.x = o.scale * 1.3;
                  sf.scale.y = o.scale * 1.3
                }
                sf.x = tx - viewX;
                sf.y = ty - viewY
              }
            }
            fj = bp - 1;
            fjm4 = fj - 4;
            for (j = fj; j >= 0; j--) {
              sg = sgs[j];
              sh = shs[j];
              sh2 = shs2[j];
              sf = sfs[j];
              sfu = sfus[j];
              sd = sds[j];
              if (pbu[j] >= 1) {
                px = pbx[j];
                py = pby[j];
                k = 0;
                if (!o.cusk)
                  if (klp) {
                    k = j % kl2;
                    if (k >= kl) k = kl2 - (k + 1)
                  } else k = j % kl;
                pci = per_color_imgs[rbcs[j % rbl]];
                if (!sgsv[j]) {
                  sg.visible =
                    true;
                  sh.visible = true;
                  sh2.visible = true;
                  sf.visible = true;
                  sfu.visible = true;
                  sgsv[j] = true;
                  sg.texture = pci.kmouseOverStates[k].t;
                  sf.texture = pci.kfo.t;
                  sfu.texture = pci.kfo.t
                }
                if (pbu[j] >= 2) {
                  k = j - 4;
                  if (k < 0) k = 0;
                  if (k < 9) {
                    sh.alpha = a * (1 - k / 9);
                    if (j < 4) {
                      var tsc = 1 + (4 - j) * o.swell;
                      sh.scale.x = tsc * o.scale * .88;
                      sh.scale.y = tsc * o.scale * .88
                    } else {
                      sh.scale.x = o.scale * .88;
                      sh.scale.y = o.scale * .88
                    }
                    sh.x = px - viewX;
                    sh.y = py - viewY
                  } else if (j >= fjm4) {
                    sh.alpha = 1;
                    sh.scale.x = o.scale * .88;
                    sh.scale.y = o.scale * .88;
                    sh.x = px - viewX;
                    sh.y = py - viewY
                  } else sh.alpha = 0
                } else sh.alpha = 0;
                sg.alpha =
                  a;
                sg.rotation = pba[j];
                if (j < 4) {
                  var tsc = 1 + (4 - j) * o.swell;
                  sg.scale.x = tsc * o.scale * .62;
                  sg.scale.y = tsc * o.scale * .62
                } else {
                  sg.scale.x = o.scale * .62;
                  sg.scale.y = o.scale * .62
                }
                sg.x = px - viewX;
                sg.y = py - viewY;
                segmentsDrawn++;
                if (o.isDead) {
                  var falf = (.15 + .15 * Math.abs(Math.sin(5 * Math.PI * o.isDead_amt))) * Math.sin(Math.PI * o
                    .isDead_amt);
                  ox = tx;
                  oy = ty;
                  tx = sg.x;
                  ty = sg.y;
                  if (tx > ox) d2 = tx - ox;
                  else d2 = ox - tx;
                  if (ty > oy) d2 += ty - oy;
                  else d2 += oy - ty;
                  d2 /= 6;
                  if (d2 > 1) d2 = 1;
                  sd.scale.x = sg.scale.x * ksz / 64;
                  sd.scale.y = sg.scale.y * ksz / 64;
                  sd.x = sg.x;
                  sd.y = sg.y;
                  sd.visible = true;
                  sd.alpha =
                    d2 * falf * (.6 + .4 * Math.cos(j / 4 - 15 * o.isDead_amt))
                }
              } else if (sgsv[j]) {
                sg.visible = false;
                sh.visible = false;
                sh2.visible = false;
                sf.visible = false;
                sfu.visible = false;
                sd.visible = false;
                sgsv[j] = false
              }
            }
          } else
            for (j = bp - 1; j >= 0; j--)
              if (pbu[j] >= 1) {
                px = pbx[j];
                py = pby[j];
                if (j >= 4) {
                  k = j - 4;
                  if (pbu[k] == 2) {
                    ox = tx;
                    oy = ty;
                    tx = pbx[k];
                    ty = pby[k];
                    ctx.save();
                    ctx.translate((tx - viewX) * gameScale, (ty - viewY) * gameScale);
                    if (k < 9) {
                      ctx.globalAlpha = a * (k / 9);
                      if (k < 4) {
                        var tsz = shsz * (1 + (4 - k) * o.swell);
                        ctx.drawImage(ksmainCanvas, -tsz, -tsz, 2 * tsz, 2 * tsz)
                      } else ctx.drawImage(ksmainCanvas, -shsz,
                        -shsz, 2 * shsz, 2 * shsz)
                    } else {
                      if (tx > ox) d2 = tx - ox;
                      else d2 = ox - tx;
                      if (ty > oy) d2 += ty - oy;
                      else d2 += oy - ty;
                      d2 /= 6;
                      if (d2 > 1) d2 = 1;
                      ctx.globalAlpha = a * d2;
                      ctx.drawImage(ksmainCanvas, -shsz, -shsz, 2 * shsz, 2 * shsz)
                    }
                    ctx.restore()
                  }
                }
                ctx.save();
                ctx.globalAlpha = a;
                ctx.translate((px - viewX) * gameScale, (py - viewY) * gameScale);
                if (!nsr) ctx.rotate(pba[j]);
                var k = 0;
                if (!o.cusk)
                  if (klp) {
                    k = j % kl2;
                    if (k >= kl) k = kl2 - (k + 1)
                  } else k = j % kl;
                pci = per_color_imgs[rbcs[j % rbl]];
                if (j < 4) {
                  var tsz = lsz * (1 + (4 - j) * o.swell);
                  ctx.drawImage(pci.kmcs[k], -gameScale * tsz, -gameScale * tsz, gameScale * 2 * tsz, gameScale * 2 *
                    tsz)
                } else ctx.drawImage(pci.kmcs[k],
                  -gameScale * lsz, -gameScale * lsz, gameScale * 2 * lsz, gameScale * 2 * lsz);
                if (fdhc && j < fdl) {
                  fdam = 1 - j / fdl;
                  pci = per_color_imgs[fdhc];
                  ctx.globalAlpha = a * fdam;
                  var tsz = (1 + .05 * fdam) * lsz * (1 + (4 - j) * o.swell);
                  ctx.drawImage(pci.kmcs[0], -gameScale * tsz, -gameScale * tsz, gameScale * 2 * tsz, gameScale * 2 *
                    tsz)
                }
                if (fdtc && j > bp - fdl) {
                  fdam = 1 - (bp - j) / fdl;
                  pci = per_color_imgs[fdtc];
                  ctx.globalAlpha = a * fdam;
                  var tsz = (1 + .05 * fdam) * lsz * (1 + (4 - j) * o.swell);
                  ctx.drawImage(pci.kmcs[0], -gameScale * tsz, -gameScale * tsz, gameScale * 2 * tsz, gameScale * 2 *
                    tsz)
                }
                ctx.restore()
              } if (!useWebGL)
            if (o.targetSpeed > o.fsp)
              if (highQuality || graphicsLevelAlpha > 0) {
                ctx.save();
                ctx.globalCompositeOperation =
                  "lighter";
                var dj = 4;
                if (dragonEyes) dj = 12;
                var glsz = lsz * 2;
                for (j = bp - 1; j >= 0; j--)
                  if (pbu[j] == 2) {
                    ox = tx;
                    oy = ty;
                    tx = pbx[j];
                    ty = pby[j];
                    if (tx > ox) d2 = tx - ox;
                    else d2 = ox - tx;
                    if (ty > oy) d2 += ty - oy;
                    else d2 += oy - ty;
                    d2 /= 6;
                    if (d2 > 1) d2 = 1;
                    ctx.save();
                    ctx.translate((tx - viewX) * gameScale, (ty - viewY) * gameScale);
                    ctx.globalAlpha = d2 * a * om * graphicsLevelAlpha * (.5 + .5 * Math.cos(j / dj - o.smoothFrame));
                    var k = 0;
                    if (!o.cusk)
                      if (klp) {
                        k = j % kl2;
                        if (k >= kl) k = kl2 - (k + 1)
                      } else k = j % kl;
                    if (j < 4) {
                      var tsz = glsz * (1 + (4 - j) * o.swell);
                      ctx.drawImage(per_color_imgs[rbcs[j % rbl]].kfmainCanvas, -gameScale * tsz, -gameScale * tsz,
                        gameScale * 2 * tsz, gameScale *
                        2 * tsz)
                    } else ctx.drawImage(per_color_imgs[rbcs[j % rbl]].kfmainCanvas, -gameScale * glsz, -gameScale *
                      glsz, gameScale * 2 * glsz, gameScale * 2 * glsz);
                    ctx.restore()
                  } ctx.restore()
              }
        } else {
          for (j = bp - 1; j >= 0; j--)
            if (pbu[j] >= 1) {
              px = pbx[j];
              py = pby[j];
              if (j >= 4) {
                k = j - 4;
                if (pbu[k] == 2) {
                  ox = tx;
                  oy = ty;
                  tx = pbx[k];
                  ty = pby[k];
                  ctx.save();
                  ctx.translate((tx - viewX) * gameScale, (ty - viewY) * gameScale);
                  if (k < 9) {
                    ctx.globalAlpha = a * (k / 9);
                    if (k < 4) {
                      var tsz = shsz * (1 + (4 - k) * o.swell);
                      ctx.drawImage(ksmainCanvas, -tsz, -tsz, 2 * tsz, 2 * tsz)
                    } else ctx.drawImage(ksmainCanvas, -shsz, -shsz, 2 * shsz, 2 * shsz)
                  } else {
                    if (tx > ox) d2 = tx - ox;
                    else d2 =
                      ox - tx;
                    if (ty > oy) d2 += ty - oy;
                    else d2 += oy - ty;
                    d2 /= 6;
                    if (d2 > 1) d2 = 1;
                    ctx.globalAlpha = a * d2;
                    ctx.drawImage(ksmainCanvas, -shsz, -shsz, 2 * shsz, 2 * shsz)
                  }
                  ctx.restore()
                }
              }
              ctx.save();
              ctx.globalAlpha = a;
              ctx.translate((px - viewX) * gameScale, (py - viewY) * gameScale);
              if (!nsr) ctx.rotate(pba[j]);
              var k = 0;
              if (!o.cusk)
                if (klp) {
                  k = j % kl2;
                  if (k >= kl) k = kl2 - (k + 1)
                } else k = j % kl;
              if (j < 4) {
                var tsz = lsz * (1 + (4 - j) * o.swell);
                ctx.drawImage(kmcs[k], -gameScale * tsz, -gameScale * tsz, gameScale * 2 * tsz, gameScale * 2 * tsz)
              } else ctx.drawImage(kmcs[k], -gameScale * lsz, -gameScale * lsz, gameScale * 2 * lsz, gameScale * 2 *
                lsz);
              ctx.restore()
            } if (o.targetSpeed >
            o.fsp)
            if (highQuality || graphicsLevelAlpha > 0) {
              ctx.save();
              ctx.globalCompositeOperation = "lighter";
              var dj = 4;
              if (dragonEyes) dj = 12;
              var glsz = lsz * 2;
              for (j = bp - 1; j >= 0; j--)
                if (pbu[j] == 2) {
                  ox = tx;
                  oy = ty;
                  tx = pbx[j];
                  ty = pby[j];
                  var k = 0;
                  if (!o.cusk)
                    if (klp) {
                      k = j % kl2;
                      if (k >= kl) k = kl2 - (k + 1)
                    } else k = j % kl;
                  if (tx > ox) d2 = tx - ox;
                  else d2 = ox - tx;
                  if (ty > oy) d2 += ty - oy;
                  else d2 += oy - ty;
                  d2 /= 6;
                  if (d2 > 1) d2 = 1;
                  ctx.save();
                  ctx.translate((tx - viewX) * gameScale, (ty - viewY) * gameScale);
                  ctx.globalAlpha = d2 * a * om * graphicsLevelAlpha * (.5 + .5 * Math.cos(j / dj - o.smoothFrame));
                  if (j < 4) {
                    var tsz = glsz * (1 + (4 - j) * o.swell);
                    ctx.drawImage(opci.kfmainCanvas,
                      -gameScale * tsz, -gameScale * tsz, gameScale * 2 * tsz, gameScale * 2 * tsz)
                  } else ctx.drawImage(opci.kfmainCanvas, -gameScale * glsz, -gameScale * glsz, gameScale * 2 * glsz,
                    gameScale * 2 * glsz);
                  ctx.restore()
                } ctx.restore()
            }
        }
        if (testing && shifty) {
          for (j = o.bodyPoints.length - 1; j >= 0; j--) {
            var po = o.bodyPoints[j];
            px = po.segmentX + po.segmentInterpX;
            py = po.segmentY + po.segmentInterpY;
            ctx.save();
            if (po.segmentDying) ctx.fillStyle = "#FF0000";
            else ctx.fillStyle = "#FF00FF";
            ctx.globalAlpha = 1 - po.segmentDa;
            ctx.translate(0 * canvasWidth / 2 + (px - viewX) * gameScale, 0 * canvasHeight / 2 + (py - viewY) *
              gameScale);
            ctx.fillRect(-4, -4, 8, 8);
            ctx.restore()
          }
          for (j = o.bodyPoints.length - 1; j >= 0; j--) {
            po = o.bodyPoints[j];
            if (!po.segmentDying) {
              px = po.segmentX +
                po.segmentInterpX;
              py = po.segmentY + po.segmentInterpY;
              ctx.fillStyle = "#FFFFFF";
              ctx.globalAlpha = 1 - po.segmentDa;
              ctx.save();
              ctx.translate(0 * canvasWidth / 2 + (px - viewX) * gameScale, 0 * canvasHeight / 2 + (py - viewY) *
                gameScale);
              ctx.fillRect(-2, -2, 4, 4);
              ctx.restore()
            }
          }
          for (j = 0; j < bp; j++) {
            ctx.save();
            ctx.fillStyle = "#00FF00";
            ctx.translate(0 * canvasWidth / 2 + (gptz[j].xx - viewX) * gameScale, 0 * canvasHeight / 2 + (gptz[j].yy -
              viewY) * gameScale);
            ctx.fillRect(-1, -1, 2, 2);
            ctx.restore()
          }
        }
        if (o.antenna) {
          tx = Math.cos(o.currentAngle);
          ty = Math.sin(o.currentAngle);
          ax = hx - tx * 8 * o.scale;
          ay = hy - ty * 8 * o.scale;
          if (bp >= 2 && (ax >= allBoundsMinX && ay >= allBoundsMinY && ax <= allBoundsMaxX && ay <= allBoundsMaxY)) {
            o.atx[0] =
              ax;
            o.aty[0] = ay;
            var m = o.scale * gameScale;
            fj = o.atx.length - 1;
            if (choosingSkin)
              for (var j = 1; j <= fj; j++) {
                o.atvx[j] -= .3;
                o.atvy[j] += Math.cos(frameCounter / 23 - 7 * j / fj) * .14
              } else if (!o.antenna_shown) {
                o.antenna_shown = true;
                for (var j = 1; j <= fj; j++) {
                  o.atx[j] = ax - tx * j * 4 * o.scale;
                  o.aty[j] = ay - ty * j * 4 * o.scale
                }
              } for (var j = 1; j <= fj; j++) {
              xx = o.atx[j - 1];
              yy = o.aty[j - 1];
              xx += Math.random() * 2 - 1;
              yy += Math.random() * 2 - 1;
              tx = o.atx[j] - xx;
              ty = o.aty[j] - yy;
              if (tx >= -4 && ty >= -4 && tx < 4 && ty < 4) ang = at2lt[ty * 32 + 128 << 8 | tx * 32 + 128];
              else if (tx >= -8 && ty >= -8 && tx < 8 && ty < 8) ang = at2lt[ty * 16 + 128 <<
                8 | tx * 16 + 128];
              else if (tx >= -16 && ty >= -16 && tx < 16 && ty < 16) ang = at2lt[ty * 8 + 128 << 8 | tx * 8 + 128];
              else if (tx >= -127 && ty >= -127 && tx < 127 && ty < 127) ang = at2lt[ty + 128 << 8 | tx + 128];
              else ang = Math.atan2(ty, tx);
              xx += Math.cos(ang) * 4 * o.scale;
              yy += Math.sin(ang) * 4 * o.scale;
              o.atvx[j] += (xx - o.atx[j]) * .1;
              o.atvy[j] += (yy - o.aty[j]) * .1;
              o.atx[j] += o.atvx[j];
              o.aty[j] += o.atvy[j];
              o.atvx[j] *= .88;
              o.atvy[j] *= .88;
              tx = o.atx[j] - o.atx[j - 1];
              ty = o.aty[j] - o.aty[j - 1];
              d = Math.sqrt(tx * tx + ty * ty);
              if (d > 4 * o.scale) {
                if (tx >= -4 && ty >= -4 && tx < 4 && ty < 4) ang = at2lt[ty * 32 + 128 << 8 | tx * 32 +
                  128];
                else if (tx >= -8 && ty >= -8 && tx < 8 && ty < 8) ang = at2lt[ty * 16 + 128 << 8 | tx * 16 + 128];
                else if (tx >= -16 && ty >= -16 && tx < 16 && ty < 16) ang = at2lt[ty * 8 + 128 << 8 | tx * 8 + 128];
                else if (tx >= -127 && ty >= -127 && tx < 127 && ty < 127) ang = at2lt[ty + 128 << 8 | tx + 128];
                else ang = Math.atan2(ty, tx);
                o.atx[j] = o.atx[j - 1] + Math.cos(ang) * 4 * o.scale;
                o.aty[j] = o.aty[j - 1] + Math.sin(ang) * 4 * o.scale
              }
            }
            ctx.globalAlpha = a;
            ctx.strokeStyle = o.atc1;
            ctx.lineWidth = 5 * m;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            fj = o.atx.length - 1;
            tx = (o.atx[fj] - viewX) * gameScale;
            ty = (o.aty[fj] -
              viewY) * gameScale;
            ctx.moveTo(tx, ty);
            for (var j = fj - 1; j >= 1; j--) {
              xx = (o.atx[j] - viewX) * gameScale;
              yy = (o.aty[j] - viewY) * gameScale;
              if (Math.abs(xx - tx) + Math.abs(yy - ty) >= 1) {
                tx = xx;
                ty = yy;
                ctx.lineTo(tx, ty)
              }
            }
            xx = ((o.atx[1] + o.atx[0]) * .5 - viewX) * gameScale;
            yy = ((o.aty[1] + o.aty[0]) * .5 - viewY) * gameScale;
            if (Math.abs(xx - tx) + Math.abs(yy - ty) >= 1) {
              tx = xx;
              ty = yy;
              ctx.lineTo(tx, ty)
            }
            ctx.stroke();
            ctx.globalAlpha = o.atia * a;
            ctx.strokeStyle = o.atc2;
            ctx.lineWidth = 4 * m;
            ctx.beginPath();
            fj = o.atx.length - 1;
            tx = (o.atx[fj] - viewX) * gameScale;
            ty = (o.aty[fj] - viewY) * gameScale;
            ctx.moveTo(tx,
              ty);
            for (var j = fj - 1; j >= 0; j--) {
              xx = (o.atx[j] - viewX) * gameScale;
              yy = (o.aty[j] - viewY) * gameScale;
              if (Math.abs(xx - tx) + Math.abs(yy - ty) >= 1) {
                tx = xx;
                ty = yy;
                ctx.lineTo(tx, ty)
              }
            }
            ctx.stroke();
            if (o.atwg) {
              ctx.lineWidth = 3 * m;
              ctx.stroke();
              ctx.lineWidth = 2 * m;
              ctx.stroke()
            }
            ctx.globalAlpha = a * o.blba;
            if (o.abrot) {
              ctx.save();
              ctx.translate((o.atx[fj] - viewX) * gameScale, (o.aty[fj] - viewY) * gameScale);
              vang = Math.atan2(o.aty[fj] - o.aty[fj - 1], o.atx[fj] - o.atx[fj - 1]) - o.atba;
              if (vang < 0 || vang >= TWO_PI) vang %= TWO_PI;
              if (vang < -Math.PI) vang += TWO_PI;
              else if (vang > Math.PI) vang -=
                TWO_PI;
              o.atba = (o.atba + vang * .15) % TWO_PI;
              ctx.rotate(o.atba);
              ctx.drawImage(o.bulb, o.blbx * o.bsc * m, o.blby * o.bsc * m, o.blbw * o.bsc * m, o.bleaderboardHeader *
                o.bsc * m);
              ctx.restore()
            } else ctx.drawImage(o.bulb, (o.atx[fj] - viewX + o.blbx * o.bsc * o.scale) * gameScale, (o.aty[fj] -
              viewY + o.blby * o.bsc * o.scale) * gameScale, o.blbw * o.bsc * m, o.bleaderboardHeader * o.bsc * m);
            if (o.apbs) {
              ctx.globalAlpha = .5 * a;
              ctx.lineWidth = 3 * m;
              ctx.stroke();
              ctx.lineWidth = 2 * m;
              ctx.stroke()
            }
          } else if (o.antenna_shown) o.antenna_shown = false
        }
        if (!useWebGL)
          if (o.isDead) {
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            var falf =
              (.15 + .15 * Math.abs(Math.sin(5 * Math.PI * o.isDead_amt))) * Math.sin(Math.PI * o.isDead_amt);
            var dsz = gameScale * lsz;
            for (j = bp - 1; j >= 0; j--)
              if (pbu[j] == 2) {
                ox = tx;
                oy = ty;
                tx = pbx[j];
                ty = pby[j];
                if (tx > ox) d2 = tx - ox;
                else d2 = ox - tx;
                if (ty > oy) d2 += ty - oy;
                else d2 += oy - ty;
                d2 /= 6;
                if (d2 > 1) d2 = 1;
                px = pbx[j];
                py = pby[j];
                ctx.save();
                ctx.globalAlpha = d2 * falf * (.6 + .4 * Math.cos(j / 4 - 15 * o.isDead_amt));
                ctx.translate((px - viewX) * gameScale, (py - viewY) * gameScale);
                if (j < 4) {
                  var tsz = dsz * (1 + (4 - j) * o.swell);
                  ctx.drawImage(kdmainCanvas, -tsz, -tsz, 2 * tsz, 2 * tsz)
                } else ctx.drawImage(kdmainCanvas, -dsz, -dsz,
                  2 * dsz, 2 * dsz);
                ctx.restore()
              } ctx.restore()
          } ctx.restore()
      }
      if (o.one_eye) {
        var ed = 3 * ssc;
        var ex = Math.cos(fang) * ed;
        var ey = Math.sin(fang) * ed;
        var esz = ssc * o.ebisz;
        if (useWebGL) {
          o.ebi.x = ex + hx - viewX;
          o.ebi.y = ey + hy - viewY;
          if (o.isDead_amt == 0) o.ebi.alpha = 1;
          else o.ebi.alpha = Math.sqrt(1 - o.isDead_amt);
          o.ebi.scale.x = o.ebi.scale.y = esz / 64
        } else {
          if (o.isDead_amt == 0) ctx.globalAlpha = 1;
          else ctx.globalAlpha = Math.sqrt(1 - o.isDead_amt);
          ctx.drawImage(o.ebi, 0, 0, o.ebiw, o.ebih, canvasWidthHalf + (ex + hx - esz / 2 - viewX) * gameScale,
            canvasHeightHalf + (ey + hy - esz / 2 - viewY) * gameScale, esz * gameScale,
            esz * gameScale)
        }
        var ex = Math.cos(fang) * (ed + .15) + o.rex * ssc;
        var ey = Math.sin(fang) * (ed + .15) + o.rey * ssc;
        var esz = ssc * o.episz;
        if (useWebGL) {
          o.epi.x = ex + hx - viewX;
          o.epi.y = ey + hy - viewY;
          o.epi.scale.x = o.epi.scale.y = esz / 48
        } else ctx.drawImage(o.epi, 0, 0, o.epiw, o.epih, canvasWidthHalf + (ex + hx - esz / 2 - viewX) * gameScale,
          canvasHeightHalf + (ey + hy - esz / 2 - viewY) * gameScale, esz * gameScale, esz * gameScale)
      } else {
        if (!o.eac) drawEyes(o, ctx, fang, ssc, 1, 1);
        if (o.accessory != -1) {
          var ed = o.ed * ssc;
          var j = o.accessory;
          if (j >= 0 && j < a_ct) {
            var ex = Math.cos(fang) * ed;
            var ey = Math.sin(fang) * ed;
            var ai = a_imgs[j];
            var ii = ai.img;
            if (ii == null) {
              ii = document.createElement("img");
              a_imgs[j].img = ii;
              ii.onload = function() {
                for (var i = a_imgs.length - 1; i >= 0; i--)
                  if (a_imgs[i].img == this) {
                    var o = a_imgs[i];
                    o.ww = this.width;
                    o.hh = this.height;
                    o.loaded = true;
                    break
                  }
              };
              ii.src = a_imgs[j].u
            } else if (ai.loaded) {
              var m = o.scale * gameScale * ai.sc;
              ctx.save();
              ctx.translate(canvasWidthHalf + (ex + hx - viewX) * gameScale, canvasHeightHalf + (ey + hy - viewY) *
                gameScale);
              ctx.rotate(fang);
              ctx.globalAlpha = a;
              ctx.drawImage(ii, 0, 0, ai.ww, ai.hh, -m * ai.px, -m * ai.py, m * ai.ww, m * ai.hh);
              ctx.restore()
            }
          }
        }
        if (o.jyt) {
          var m = o.scale *
            gameScale * .25;
          var ed = -3 * ssc;
          var esp = 7 * ssc;
          var ex = Math.cos(fang) * (ed + .5) + o.rex * ssc + Math.cos(fang - Math.PI / 2) * esp;
          var ey = Math.sin(fang) * (ed + .5) + o.rey * ssc + Math.sin(fang - Math.PI / 2) * esp;
          ctx.save();
          ctx.translate(canvasWidthHalf + (ex + hx - viewX) * gameScale, canvasHeightHalf + (ey + hy - viewY) *
            gameScale);
          ctx.rotate(fang);
          ctx.drawImage(ecmainCanvas, -24 * m, -24 * m, 48 * m, 48 * m);
          ctx.restore();
          var ex = Math.cos(fang) * (ed + .5) + o.rex * ssc + Math.cos(fang + Math.PI / 2) * esp;
          var ey = Math.sin(fang) * (ed + .5) + o.rey * ssc + Math.sin(fang + Math.PI / 2) * esp;
          ctx.save();
          ctx.translate(canvasWidthHalf + (ex + hx - viewX) *
            gameScale, canvasHeightHalf + (ey + hy - viewY) * gameScale);
          ctx.rotate(fang);
          ctx.drawImage(ecmainCanvas, -24 * m, -24 * m, 48 * m, 48 * m);
          ctx.restore();
          var ed = 5 * ssc;
          var ex = Math.cos(fang) * (ed + .5) + o.rex * ssc;
          var ey = Math.sin(fang) * (ed + .5) + o.rey * ssc;
          m = o.scale * gameScale * .16;
          ctx.save();
          ctx.translate(canvasWidthHalf + (ex + hx - viewX) * gameScale, canvasHeightHalf + (ey + hy - viewY) *
            gameScale);
          ctx.rotate(fang);
          ctx.drawImage(jmou, -40 * m, -65 * m, 79 * m, 130 * m);
          ctx.restore()
        }
      }
      ctx.globalAlpha = 1;
      if (o.slg) {
        var m = o.scale * gameScale * .25;
        if (useWebGL) {
          var tx = Math.cos(fang) * 13 * ssc + Math.cos(fang - Math.PI / 2) * (6 * ssc + .5);
          var ty = Math.sin(fang) *
            13 * ssc + Math.sin(fang - Math.PI / 2) * (6 * ssc + .5);
          o.stem1.x = tx + hx - viewX;
          o.stem1.y = ty + hy - viewY;
          o.stem1.scale.x = o.stem1.scale.y = m;
          o.stem1.rotation = fang - .4;
          var tx = Math.cos(fang) * 13 * ssc + Math.cos(fang + Math.PI / 2) * (6 * ssc + .5);
          var ty = Math.sin(fang) * 13 * ssc + Math.sin(fang + Math.PI / 2) * (6 * ssc + .5);
          o.stem2.x = tx + hx - viewX;
          o.stem2.y = ty + hy - viewY;
          o.stem2.scale.x = o.stem2.scale.y = m;
          o.stem2.rotation = fang + .4
        } else {
          ctx.save();
          var tx = Math.cos(fang) * 13 * ssc + Math.cos(fang - Math.PI / 2) * (6 * ssc + .5);
          var ty = Math.sin(fang) * 13 * ssc + Math.sin(fang -
            Math.PI / 2) * (6 * ssc + .5);
          ctx.translate(canvasWidthHalf + (tx + hx - viewX) * gameScale, canvasHeightHalf + (ty + hy - viewY) *
            gameScale);
          ctx.rotate(fang - .4);
          ctx.drawImage(sest, -28 * m, -44 * m, 105 * m, 88 * m);
          ctx.restore();
          ctx.save();
          var tx = Math.cos(fang) * 13 * ssc + Math.cos(fang + Math.PI / 2) * (6 * ssc + .5);
          var ty = Math.sin(fang) * 13 * ssc + Math.sin(fang + Math.PI / 2) * (6 * ssc + .5);
          ctx.translate(canvasWidthHalf + (tx + hx - viewX) * gameScale, canvasHeightHalf + (ty + hy - viewY) *
            gameScale);
          ctx.rotate(fang + .4);
          ctx.drawImage(sest, -28 * m, -44 * m, 105 * m, 88 * m);
          ctx.restore()
        }
      }
    }
  }
  if (team_mode) {
    ctx.save();
    ctx.globalAlpha = .5;
    for (var i =
        allSnakes.length - 1; i >= 0; i--) {
      o = allSnakes[i];
      if (o.isInView)
        if (!o.eac) drawEyes(o, ctx, o.eyeAngle, o.scale, .4, .75)
    }
    ctx.restore()
  }
  if (useWebGL) {
    var ba = 1;
    var ba2 = .75;
    foodsDrawn = 0;
    for (var i = foodsCount - 1; i >= 0; i--) {
      var fo = allFoods[i];
      var fi = fo.fi;
      var ofi = fo.ofi;
      var gfi = fo.gfi;
      var g2fi = fo.g2fi;
      if (fo.foodRenderX >= foodBoundsMinX && fo.foodRenderY >= foodBoundsMinY && fo.foodRenderX <= foodBoundsMaxX &&
        fo.foodRenderY <= foodBoundsMaxY) {
        tx = fo.foodRenderX - viewX;
        ty = fo.foodRenderY - viewY;
        ofi.x = tx;
        ofi.y = ty;
        fi.x = tx;
        fi.y = ty;
        foodsDrawn++;
        fd2 = tx * tx + ty * ty;
        if (fd2 > 1E6) {
          gfi.alpha = 0;
          g2fi.alpha = 0
        } else {
          fs = 1 + .064 * fo.foodRadius;
          fal = .21 * (1 - fd2 / (44600 + fd2));
          if (fo.foodRadius != 1) fal *=
            fo.foodRadius;
          gfi.alpha = fal * (.7 + .3 * Math.cos(fo.gframeCounter / 13)) * fo.frameCounter;
          gfi.x = tx * fs;
          gfi.y = ty * fs;
          fs = 1 + .21 * fo.foodRadius;
          fx = tx * fs;
          fy = ty * fs;
          fal = .085 * (1 - fd2 / (16500 + fd2));
          if (fo.foodRadius != 1) fal *= fo.foodRadius;
          g2fi.alpha = fal * (.7 + .3 * Math.cos(fo.gframeCounter / 13)) * fo.frameCounter;
          g2fi.x = fx;
          g2fi.y = fy
        }
        if (fo.frameCounter == 1 && fo.foodRadius == 1) {
          ofi.alpha = ba;
          fi.alpha = .25 + ba2 * (.5 + .5 * Math.cos(fo.gframeCounter / 13));
          ofi.scale.x = .0165 + fo.foodSize * .03;
          ofi.scale.y = .0165 + fo.foodSize * .03;
          fi.scale.x = .04 + fo.foodSize / 15;
          fi.scale.y = .04 + fo.foodSize / 15;
          gfi.scale.x = fo.foodSize / 5;
          gfi.scale.y = fo.foodSize / 5;
          g2fi.scale.x = fo.foodSize / 3;
          g2fi.scale.y = fo.foodSize /
            3
        } else {
          ofi.alpha = ba * fo.frameCounter;
          fi.alpha = .25 + ba2 * (.5 + .5 * Math.cos(fo.gframeCounter / 13)) * fo.frameCounter;
          ofi.scale.x = .0165 + fo.foodSize * .03 * fo.foodRadius;
          ofi.scale.y = .0165 + fo.foodSize * .03 * fo.foodRadius;
          fi.scale.x = .04 + fo.foodSize / 15 * fo.foodRadius;
          fi.scale.y = .04 + fo.foodSize / 15 * fo.foodRadius;
          gfi.scale.x = fo.foodSize / 5 * fo.foodRadius;
          gfi.scale.y = fo.foodSize / 5 * fo.foodRadius;
          g2fi.scale.x = fo.foodSize / 3 * fo.foodRadius;
          g2fi.scale.y = fo.foodSize / 3 * fo.foodRadius
        }
        if (!fi.visible) {
          fi.visible = true;
          ofi.visible = true;
          gfi.visible = true;
          g2fi.visible = true
        }
      } else if (fi.visible) {
        fi.visible = false;
        ofi.visible = false;
        gfi.visible = false;
        g2fi.visible = false
      }
    }
  } else {
    if (highQuality ||
      graphicsLevelAlpha > 0) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (var i = foodsCount - 1; i >= 0; i--) {
        var fo = allFoods[i];
        if (fo.foodRenderX >= foodBoundsMinX && fo.foodRenderY >= foodBoundsMinY && fo.foodRenderX <=
          foodBoundsMaxX && fo.foodRenderY <= foodBoundsMaxY) {
          tx = fo.foodRenderX - viewX;
          ty = fo.foodRenderY - viewY;
          fd2 = tx * tx + ty * ty;
          fs = 1 + .06 * fo.foodRadius;
          fx = tx * fs;
          fy = ty * fs;
          fal = .005 + .09 * (1 - fd2 / (86E3 + fd2));
          if (fo.foodRadius != 1) fal *= Math.pow(fo.foodRadius, .25);
          if (graphicsLevelAlpha != 1) fal *= graphicsLevelAlpha;
          fx = fx * gameScale + canvasWidthHalf;
          fy = fy * gameScale + canvasHeightHalf;
          if (fo.foodRadius == 1) {
            fx -= fo.gfw2;
            fy -= fo.gfh2;
            ctx.globalAlpha = fal * fo.frameCounter;
            ctx.drawImage(fo.gfi, fx, fy);
            ctx.globalAlpha = fal * (.5 + .5 * Math.cos(fo.gframeCounter / 13)) *
              fo.frameCounter;
            ctx.drawImage(fo.gfi, fx, fy)
          } else {
            fx -= fo.gfw2 * fo.foodRadius;
            fy -= fo.gfh2 * fo.foodRadius;
            ctx.globalAlpha = fal * fo.frameCounter;
            ctx.drawImage(fo.gfi, 0, 0, fo.gfw, fo.gfh, fx, fy, fo.gfw * fo.foodRadius, fo.gfh * fo.foodRadius);
            ctx.globalAlpha = fal * (.5 + .5 * Math.cos(fo.gframeCounter / 13)) * fo.frameCounter;
            ctx.drawImage(fo.gfi, 0, 0, fo.gfw, fo.gfh, fx, fy, fo.gfw * fo.foodRadius, fo.gfh * fo.foodRadius)
          }
          fs = 1 + .32 * fo.foodRadius;
          fx = tx * fs;
          fy = ty * fs;
          fal = .085 * (1 - fd2 / (16500 + fd2));
          if (fo.foodRadius != 1) fal *= Math.pow(fo.foodRadius, .25);
          if (graphicsLevelAlpha != 1) fal *= graphicsLevelAlpha;
          fx = fx * gameScale + canvasWidthHalf;
          fy = fy * gameScale + canvasHeightHalf;
          if (fo.foodRadius == 1) {
            fx -= fo.g2fw2;
            fy -= fo.g2fh2;
            ctx.globalAlpha =
              fal * fo.frameCounter;
            ctx.drawImage(fo.g2fi, fx, fy);
            ctx.globalAlpha = fal * (.5 + .5 * Math.cos(fo.gframeCounter / 13)) * fo.frameCounter;
            ctx.drawImage(fo.g2fi, fx, fy)
          } else {
            fx -= fo.g2fw2 * fo.foodRadius;
            fy -= fo.g2fh2 * fo.foodRadius;
            ctx.globalAlpha = fal * fo.frameCounter;
            ctx.drawImage(fo.g2fi, 0, 0, fo.g2fw, fo.g2fh, fx, fy, fo.g2fw * fo.foodRadius, fo.g2fh * fo.foodRadius);
            ctx.globalAlpha = fal * (.5 + .5 * Math.cos(fo.gframeCounter / 13)) * fo.frameCounter;
            ctx.drawImage(fo.g2fi, 0, 0, fo.g2fw, fo.g2fh, fx, fy, fo.g2fw * fo.foodRadius, fo.g2fh * fo.foodRadius)
          }
        }
      }
      ctx.restore()
    }
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (var i = allPreys.length - 1; i >= 0; i--) {
      prey =
        allPreys[i];
      tx = prey.xx + prey.fx;
      ty = prey.yy + prey.fy;
      if (prey.eaten) {
        var o = prey.eaten_by;
        var k = Math.pow(prey.eaten_frameCounter, 2);
        tx += (o.headX + o.interpOffsetX + Math.cos(o.currentAngle + o.interpAngle) * (43 - k * 24) * (1 - k) - tx) *
          k;
        ty += (o.headY + o.interpOffsetY + Math.sin(o.currentAngle + o.interpAngle) * (43 - k * 24) * (1 - k) - ty) *
          k
      }
      tx -= viewX;
      ty -= viewY;
      pd2 = tx * tx + ty * ty;
      fs = 1 + .08 * prey.rad;
      px = tx * fs;
      py = ty * fs;
      pal = .4 * (1 - pd2 / (176E3 + pd2));
      if (prey.rad != 1) pal *= Math.pow(prey.rad, .25);
      px = px * gameScale + canvasWidthHalf;
      py = py * gameScale + canvasHeightHalf;
      if (prey.rad == 1) {
        if (px >= -150 && py >= -150 && px <= mwwp150 && py <= mhhp150) {
          px -= prey.gfw2;
          py -= prey.gfh2;
          ctx.globalAlpha = pal * prey.frameCounter;
          ctx.drawImage(prey.gfi,
            px, py);
          ctx.globalAlpha = pal * (.5 + .5 * Math.cos(prey.gframeCounter / 13)) * prey.frameCounter;
          ctx.drawImage(prey.gfi, px, py)
        }
      } else if (px >= -150 && py >= -150 && px <= mwwp150 && py <= mhhp150) {
        px -= prey.gfw2 * prey.rad;
        py -= prey.gfh2 * prey.rad;
        ctx.globalAlpha = pal * prey.frameCounter;
        ctx.drawImage(prey.gfi, 0, 0, prey.gfw, prey.gfh, px, py, prey.gfw * prey.rad, prey.gfh * prey.rad);
        ctx.globalAlpha = pal * (.5 + .5 * Math.cos(prey.gframeCounter / 13)) * prey.frameCounter;
        ctx.drawImage(prey.gfi, 0, 0, prey.gfw, prey.gfh, px, py, prey.gfw * prey.rad, prey.gfh * prey.rad)
      }
      fs = 1 + .32 * prey.rad;
      px = tx * fs;
      py = ty * fs;
      pal = .35 * (1 - pd2 / (46500 + pd2));
      if (prey.rad != 1) pal *= Math.pow(prey.rad,
        .25);
      trd = prey.rad * 2;
      px = px * gameScale + canvasWidthHalf;
      py = py * gameScale + canvasHeightHalf;
      if (px >= -150 && py >= -150 && px <= mwwp150 && py <= mhhp150) {
        px -= prey.gfw2 * trd;
        py -= prey.gfh2 * trd;
        ctx.globalAlpha = pal * prey.frameCounter;
        ctx.drawImage(prey.gfi, 0, 0, prey.gfw, prey.gfh, px, py, prey.gfw * trd, prey.gfh * trd);
        ctx.globalAlpha = pal * (.5 + .5 * Math.cos(prey.gframeCounter / 13)) * prey.frameCounter;
        ctx.drawImage(prey.gfi, 0, 0, prey.gfw, prey.gfh, px, py, prey.gfw * trd, prey.gfh * trd)
      }
    }
    ctx.restore()
  }
  if (!choosingSkin)
    if (Math.abs(fluxGradient - viewDistance) < 4E3) {
      ctx.save();
      ctx.lineWidth = 23 * gameScale;
      ctx.strokeStyle = "#800000";
      ctx.fillStyle = "#300000";
      ctx.globalAlpha =
        .8;
      for (i = 1; i <= 2; i++) {
        ctx.beginPath();
        k = fluxGradient;
        if (4E3 / fluxGradient > 2 * Math.PI) k = 4E3 / (2 * Math.PI);
        xx = arenaSize + Math.cos(viewAngle - 2E3 / k) * fluxGradient;
        yy = arenaSize + Math.sin(viewAngle - 2E3 / k) * fluxGradient;
        ctx.moveTo(canvasWidthHalf + (xx - viewX) * gameScale, canvasHeightHalf + (yy - viewY) * gameScale);
        for (j = -2E3; j <= 2E3; j += 100) {
          xx = arenaSize + Math.cos(viewAngle + j / k) * fluxGradient;
          yy = arenaSize + Math.sin(viewAngle + j / k) * fluxGradient;
          ctx.lineTo(canvasWidthHalf + (xx - viewX) * gameScale, canvasHeightHalf + (yy - viewY) * gameScale)
        }
        if (i == 1)
          for (j = 2E3; j >= -2E3; j -= 100) {
            xx = arenaSize + Math.cos(viewAngle + j / k) * (fluxGradient + 4E3);
            yy = arenaSize + Math.sin(viewAngle + j / k) * (fluxGradient +
              4E3);
            ctx.lineTo(canvasWidthHalf + (xx - viewX) * gameScale, canvasHeightHalf + (yy - viewY) * gameScale)
          }
        if (i == 1) {
          ctx.closePath();
          ctx.fill()
        } else ctx.stroke()
      }
      ctx.restore()
    } if (wantUpdateLeaderboard)
    if (rank > 0)
      if (slither_count > 0)
        if (isPlaying) {
          wantUpdateLeaderboard = false;
          var f_htm = "";
          var yl = "Your length";
          var ofstr = "of";
          var rstr = "Your rank";
          var tpstr = "Total voters";
          var t1str = "Points for Trump";
          var t2str = "Points for Kamala";
          var t3_enemy_pre = "";
          if (team_val == 1) t3_enemy_pre = "Kamala";
          else t3_enemy_pre = "Trump";
          var t3str = t3_enemy_pre + " supporters you've killed";
          if (lang == "de") {
            yl = "Deine L\u00e4nge";
            ofstr = "von";
            rstr = "Dein rang";
            tpstr = "Spieler";
            t1str = "Punkte fur Trump";
            t2str = "Punkte fur Kamala";
            t3str = "Besiegte"
          } else if (lang == "fr") {
            yl = "Votre longueur";
            ofstr = "de";
            rstr = "Ton rang";
            tpstr = "Joueurs";
            t1str = "Points pour Trump";
            t2str = "Points pour Kamala";
            t3str = "Vaincus"
          } else if (lang == "pt") {
            yl = "Seu comprimento";
            ofstr = "do";
            rstr = "Seu classifica\u00e7\u00e3o";
            tpstr = "Jogadores";
            t1str = "Pontos para Trump";
            t2str = "Pontos para Kamala";
            t3str = "Derrotados"
          } else if (lang == "es") {
            yl = "Tu longitud";
            ofstr = "de";
            rstr = "Tu rango";
            tpstr = "Jugadores";
            t1str = "Puntos para Trump";
            t2str = "Puntos para Kamala";
            t3str = "Derrotados"
          }
          var sct = playerSnake.sct + playerSnake.rsc;
          var score = Math.floor((fpsLengthScores[sct] + playerSnake.fam / fractionalLengthMultipliers[sct] - 1) *
            15 - 5) / 1;
          if (team_mode) {
            var cs = "#FFFFFF";
            var other_cs = "#FFFFFF";
            if (team_val == 1) {
              cs = "#FF4040";
              other_cs = "#8090FF"
            } else if (team_val == 2) {
              cs = "#8090FF";
              other_cs = "#FF4040"
            }
            if (team1Score > 0 || team2Score > 0) f_htm +=
              '<span style="font-size: 14px;"><span style="opacity: .4;">' + t1str +
              ': </span><span style="opacity: .9; font-weight: bold; color: #FF4040;">' +
              team1Score + "</span></span>";
            f_htm += "<br><br>";
            if (team1Score > 0 || team2Score > 0) f_htm +=
              '<span style="font-size: 14px;"><span style="opacity: .4;">' + t2str +
              ': </span><span style="opacity: .9; font-weight: bold; color: #8090FF;">' + team2Score +
              "</span></span>";
            f_htm += "<br><br>";
            f_htm += '<span style="font-size: 14px;"><span style="opacity: .4;">' + yl +
              ': </span><span style="opacity: .8; font-weight: bold; color: ' + cs + ';">' + score + "</span></span>";
            f_htm += '<br><br><span style="font-size: 14px;"><span style="opacity: .4;">' +
              t3str + ': </span><span style="opacity: .9; font-weight: bold; color:' + other_cs + ';">' + playerSnake
              .kill_count + "</span></span>";
            f_htm += '<br><br><span style="font-size: 14px;"><span style="opacity: .4;">' + tpstr +
              ': </span><span style="opacity: .9; font-weight: bold;">' + slither_count + "</span></span>"
          } else {
            f_htm += '<span style="font-size: 14px;"><span style="opacity: .4;">' + yl +
              ': </span><span style="opacity: .8; font-weight: bold;">' + score + "</span></span>";
            f_htm += '<BR><span style="opacity: .3;">' + rstr + ': </span><span style="opacity: .35;">' +
              rank + '</span><span style="opacity: .3;"> ' + ofstr + ' </span><span style="opacity: .35;">' +
              slither_count + "</span>"
          }
          leaderboardFooter.innerHTML = f_htm
        } ctx.restore()
};
dfe = "e" + dfe;

function drawEyes(o, ctx, fang, ssc, a, a2) {
  var ed = o.ed * ssc;
  var esp = o.esp * ssc;
  var hx = o.headX + o.interpOffsetX;
  var hy = o.headY + o.interpOffsetY;
  var ex = Math.cos(fang) * ed + Math.cos(fang - Math.PI / 2) * (esp + .5);
  var ey = Math.sin(fang) * ed + Math.sin(fang - Math.PI / 2) * (esp + .5);
  if (useWebGL) {
    var lefteye = o.lefteye;
    if (o.isDead_amt == 0) lefteye.alpha = o.eca * a;
    else lefteye.alpha = o.eca * Math.sqrt(1 - o.isDead_amt) * a;
    lefteye.x = ex + hx - viewX;
    lefteye.y = ey + hy - viewY;
    lefteye.scale.x = lefteye.scale.y = o.er * ssc / 36
  } else {
    ctx.fillStyle = o.ec;
    if (o.eo > 0) {
      ctx.lineWidth = o.eo * gameScale;
      ctx.strokeStyle =
        "#000000"
    }
    if (o.isDead_amt == 0) ctx.globalAlpha = o.eca * a;
    else ctx.globalAlpha = o.eca * Math.sqrt(1 - o.isDead_amt) * a;
    ctx.beginPath();
    ctx.arc(canvasWidthHalf + (ex + hx - viewX) * gameScale, canvasHeightHalf + (ey + hy - viewY) * gameScale, o.er *
      ssc * gameScale, 0, TWO_PI);
    ctx.closePath();
    if (o.eo > 0) ctx.stroke();
    ctx.fill()
  }
  var ex = Math.cos(fang) * (ed + .5) + o.rex * ssc + Math.cos(fang - Math.PI / 2) * esp;
  var ey = Math.sin(fang) * (ed + .5) + o.rey * ssc + Math.sin(fang - Math.PI / 2) * esp;
  if (useWebGL) {
    var leftpupil = o.leftpupil;
    if (o.isDead_amt == 0) leftpupil.alpha = o.ppa * a2;
    else leftpupil.alpha = o.ppa * Math.sqrt(1 -
      o.isDead_amt) * a2;
    leftpupil.x = ex + hx - viewX;
    leftpupil.y = ey + hy - viewY;
    leftpupil.scale.x = leftpupil.scale.y = o.prey * ssc / 21
  } else {
    if (o.isDead_amt == 0) ctx.globalAlpha = o.ppa * a2;
    else ctx.globalAlpha = o.ppa * Math.sqrt(1 - o.isDead_amt) * a2;
    ctx.fillStyle = o.ppc;
    ctx.beginPath();
    ctx.arc(canvasWidthHalf + (ex + hx - viewX) * gameScale, canvasHeightHalf + (ey + hy - viewY) * gameScale, o.prey *
      ssc * gameScale, 0, TWO_PI);
    ctx.closePath();
    ctx.fill()
  }
  var ex = Math.cos(fang) * ed + Math.cos(fang + Math.PI / 2) * (esp + .5);
  var ey = Math.sin(fang) * ed + Math.sin(fang + Math.PI / 2) * (esp + .5);
  if (useWebGL) {
    var righteye = o.righteye;
    if (o.isDead_amt == 0) righteye.alpha = o.eca * a;
    else righteye.alpha = o.eca * Math.sqrt(1 - o.isDead_amt) * a;
    righteye.x = ex + hx - viewX;
    righteye.y = ey + hy - viewY;
    righteye.scale.x = righteye.scale.y = o.er * ssc / 36
  } else {
    ctx.fillStyle = o.ec;
    if (o.eo > 0) {
      ctx.lineWidth = o.eo * gameScale;
      ctx.strokeStyle = "#000000"
    }
    if (o.isDead_amt == 0) ctx.globalAlpha = o.eca * a;
    else ctx.globalAlpha = o.eca * Math.sqrt(1 - o.isDead_amt) * a;
    ctx.beginPath();
    ctx.arc(canvasWidthHalf + (ex + hx - viewX) * gameScale, canvasHeightHalf + (ey + hy - viewY) * gameScale, o.er *
      ssc * gameScale, 0, TWO_PI);
    ctx.closePath();
    if (o.eo > 0) ctx.stroke();
    ctx.fill()
  }
  var ex =
    Math.cos(fang) * (ed + .5) + o.rex * ssc + Math.cos(fang + Math.PI / 2) * esp;
  var ey = Math.sin(fang) * (ed + .5) + o.rey * ssc + Math.sin(fang + Math.PI / 2) * esp;
  if (useWebGL) {
    var rightpupil = o.rightpupil;
    if (o.isDead_amt == 0) rightpupil.alpha = o.ppa * a2;
    else rightpupil.alpha = o.ppa * Math.sqrt(1 - o.isDead_amt) * a2;
    rightpupil.x = ex + hx - viewX;
    rightpupil.y = ey + hy - viewY;
    rightpupil.scale.x = rightpupil.scale.y = o.prey * ssc / 21
  } else {
    if (o.isDead_amt == 0) ctx.globalAlpha = o.ppa * a2;
    else ctx.globalAlpha = o.ppa * Math.sqrt(1 - o.isDead_amt) * a2;
    ctx.fillStyle = o.ppc;
    ctx.beginPath();
    ctx.arc(canvasWidthHalf + (ex + hx - viewX) * gameScale, canvasHeightHalf + (ey + hy - viewY) * gameScale, o.prey *
      ssc * gameScale, 0, TWO_PI);
    ctx.closePath();
    ctx.fill()
  }
}

function reposLbf() {
  if (team_mode) {
    leaderboardFooter.style.bottom = 22 + hsu + "px";
    leaderboardFooter.style.height = "177px"
  } else {
    leaderboardFooter.style.bottom = 4 + hsu + "px";
    leaderboardFooter.style.height = "37px"
  }
}

function reposBskbtns() {
  if (buildSkinButtons.length > 0)
    for (var i = buildSkinButtons.length - 1; i >= 0; i--) {
      var o = buildSkinButtons[i];
      var a = o.a;
      a.style.left = Math.floor(ww / 2 + o.headX) + "px";
      a.style.top = Math.floor(hh / 2 + o.headY) + "px"
    }
}

function reposCosbtns() {
  if (cosmeticButtons.length > 0)
    for (var i = cosmeticButtons.length - 1; i >= 0; i--) {
      var o = cosmeticButtons[i];
      var a = o.a;
      a.style.left = Math.floor(ww / 2 + o.headX) + "px";
      a.style.top = Math.floor(hh / 2 + o.headY) + "px"
    }
}
var ww = window.innerWidth;
var hh = window.innerHeight;
var lww = 0,
  lhh = 0;
var hsu = 0;
var csc;

function resize() {
  ww = Math.ceil(window.innerWidth);
  hh = Math.ceil(window.innerHeight);
  if (ww != lww || hh != lhh) {
    lww = ww;
    lhh = hh;
    svl_bg.style.width = ww + "px";
    svl_bg.style.height = hh + "px";
    svl.style.left = Math.round(ww / 2 - svlww / 2) + "px";
    svl.style.top = Math.round(hh / 2 - svlhh / 2) + "px";
    scoreboardMinimap.style.width = ww + "px";
    scoreboardMinimap.style.height = hh + "px";
    if (useWebGL)
      if (app.renderer) app.renderer.resize(ww, hh);
    hsu = 0;
    if (mbi) {
      var sc = ww / 1245;
      mbi.width = 1245 * sc;
      hsu = Math.ceil(260 * sc);
      mbi.height = hsu;
      hh -= hsu
    }
    ww -= wsu;
    try {
      ocho.style.width = ww + "px";
      ocho.style.height =
        hh + "px";
      adsController.resize(ww, hh)
    } catch (e) {}
    reposEnterCode();
    if (buildia_shown) reposBuildia();
    if (partycity_shown) reposPartyCity();
    locationHolder.style.bottom = 16 + hsu + "px";
    reposLbf();
    leaderboardHeader.style.right = 4 + wsu + "px";
    leaderboardScores.style.right = 4 + wsu + "px";
    leaderboardNames.style.right = 64 + wsu + "px";
    leaderboardPositions.style.right = lb_w + 64 + 16 + wsu + "px";
    locationHolder.style.right = 16 + wsu + "px";
    playQuality.style.right = 10 + wsu + "px";
    closeQuality.style.left = Math.floor(ww / 2 - 130) + "px";
    loginElement.style.width = ww + "px";
    graphicsQualityHolder.style.right = 20 + wsu + "px";
    enterCodeHolder.style.right = 20 + wsu + "px";
    cosmeticServerHolder.style.right = 20 + wsu + "px";
    if (teamsExist) {
      trumpbtnh.style.left = Math.round(ww / 2 + 290 / 2) + "px";
      trumpbtnh.style.top = Math.round(hh - 218) + "px";
      votetxth.style.left = Math.round(ww / 2 - 290 / 2) + "px";
      votetxth.style.top = Math.round(hh - 144) + "px";
      kamalabtnh.style.left = Math.round(ww / 2 - 290 / 2 - 202) + "px";
      kamalabtnh.style.top = Math.round(hh - 218) + "px"
    }
    reposGraphicsQuality();
    prevSkinHolder.style.left = Math.round(ww * .25 - 44) + "px";
    nextSkinHolder.style.left = Math.round(ww * .75 - 44) + "px";
    reposSkinStuff();
    prevSkinHolder.style.top = Math.round(hh / 2 - 44) + "px";
    nextSkinHolder.style.top = Math.round(hh / 2 - 44) + "px";
    loadingMinimapCanvas.style.left = ww / 2 - 64 + "px";
    loadingMinimapCanvas.style.top = hh / 2 - 64 + "px";
    reposBskbtns();
    reposCosbtns();
    var wdl = 1800;
    var dl = Math.sqrt(ww * ww + hh * hh);
    var ncanvasWidth = Math.ceil(ww * wdl / dl);
    var ncanvasHeight = Math.ceil(hh * wdl / dl);
    if (ncanvasWidth > 1500) {
      ncanvasHeight = Math.ceil(ncanvasHeight * 1500 / ncanvasWidth);
      ncanvasWidth = 1500
    }
    if (ncanvasHeight > 1500) {
      ncanvasWidth = Math.ceil(ncanvasWidth * 1500 / ncanvasHeight);
      ncanvasHeight = 1500
    }
    if (hh < 560) loginBaseScale = Math.max(50, hh) / 560;
    else loginBaseScale = 1;
    var sc = Math.round(loginBaseScale * loginCurrentScale * 1E5) / 1E5;
    if (sc == 1) {
      setTransform(loginElement, "");
      loginElement.style.top = "0px"
    } else {
      var lgt = Math.round(hh * (1 - loginBaseScale) * 1E5) / 1E5;
      loginElement.style.top = -lgt +
        "px";
      setTransform(loginElement, "scale(" + sc + "," + sc + ")")
    }
    if (canvasWidth != ncanvasWidth || canvasHeight != ncanvasHeight) {
      canvasWidth = ncanvasWidth;
      canvasHeight = ncanvasHeight;
      mainCanvas.width = canvasWidth;
      mainCanvas.height = canvasHeight;
      mwwp50 = canvasWidth + 50;
      mhhp50 = canvasHeight + 50;
      mwwp150 = canvasWidth + 150;
      mhhp150 = canvasHeight + 150;
      canvasWidthHalf = canvasWidth / 2;
      canvasHeightHalf = canvasHeight / 2;
      rdgbg()
    }
    csc = Math.min(ww / canvasWidth, hh / canvasHeight);
    setTransform(mainCanvas, "scale(" + csc + "," + csc + ")");
    mainCanvas.style.left = Math.floor(ww / 2 - canvasWidth / 2) + "px";
    mainCanvas.style.top = Math.floor(hh / 2 - canvasHeight / 2) + "px"
  }
  if (useWebGL) {
    if (root) {
      root.scale.x = csc;
      root.scale.y = csc;
      root.x = ww / 2;
      root.y = hh / 2
    }
    for (var i = bgees.length - 1; i >= 0; i--) {
      var o = bgees[i];
      var bgee = o.bgee;
      bgee.width = 8 + ww / csc;
      bgee.height = 8 + hh / csc
    }
  }
  redrawFrame()
}
dfe += "l";
window.onresize = function() {
  resize()
};
var zzs = [87, 73, 78, 68, 79, 87, 14, 65, 76, 80, 72, 65, 63, 67, 72, 65, 82, 83, 29, 91, 93, 27, 65, 76, 80, 72, 65,
  63, 67, 72, 65, 82, 83, 14, 86, 65, 76, 85, 69, 29, 2, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
  80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 2, 27, 87, 73, 78, 68, 79, 87, 14, 65, 76, 80, 72, 65, 63, 67, 72, 65,
  82, 83, 14, 84, 79, 51, 84, 82, 73, 78, 71, 29, 70, 85, 78, 67, 84, 73, 79, 78, 8, 9, 91, 82, 69, 84, 85, 82, 78, 2,
  65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 2, 93, 27,
  87, 73, 78, 68, 79, 87, 14, 65, 76, 80, 72, 65, 63, 67, 72, 65, 82, 83, 14, 67, 72, 65,
  82, 35, 79, 68, 69, 33, 84, 29, 70, 85, 78, 67, 84, 73, 79, 78, 8, 66, 9, 91, 2, 81, 70, 70, 25, 88, 2, 1, 29, 68,
  70, 69, 6, 6, 8, 68, 70, 69, 29, 2, 81, 70, 70, 25, 88, 2, 9, 27, 82, 69, 84, 85, 82, 78, 0, 16, 93, 27, 87, 73, 78,
  68, 79, 87, 14, 81, 70, 70, 25, 88, 29, 70, 85, 78, 67, 84, 73, 79, 78, 8, 66, 9, 91, 69, 86, 65, 76, 8, 66, 9, 27,
  73, 70, 8, 16, 28, 73, 68, 66, 65, 14, 76, 69, 78, 71, 84, 72, 9, 91, 66, 29, 16, 27, 70, 79, 82, 8, 86, 65, 82, 0,
  68, 12, 65, 12, 69, 12, 67, 29, 16, 27, 67, 28, 73, 68, 66, 65, 14, 76, 69, 78, 71, 84, 72, 27, 67, 11, 11, 9, 68,
  29, 22, 21, 12, 65, 29, 73, 68, 66, 65, 59, 67, 61, 12, 25, 23, 28, 29, 65, 6, 6, 8, 68, 11, 29,
  19, 18, 12, 65, 13, 29, 19, 18, 9, 12, 65, 13, 29, 22, 21, 12, 16, 29, 29, 67, 6, 6, 8, 66, 29, 19, 11, 65, 9, 12,
  69, 29, 65, 11, 66, 12, 69, 5, 29, 18, 22, 12, 66, 11, 29, 18, 11, 65, 12, 73, 68, 66, 65, 59, 67, 61, 29, 69, 11,
  68, 93, 68, 70, 69, 29, 2, 69, 86, 65, 76, 2, 93, 27
];
for (var i = loadingImages.length - 1; i >= 0; i--) loadingImages[i].ii.src = loadingImages[i].src;
if (waitingImageCount == 0) startAnimation();
window.onmousemove = function(e) {
  e = e || window.event;
  if (e)
    if (typeof e.clientX != "undefined") {
      mouseX = e.clientX - ww / 2;
      mouseY = e.clientY - hh / 2;
      if (!follow_view)
        if (playerSnake) {
          mouseX += (viewX - playerSnake.xx) * gameScale;
          mouseY += (viewY - playerSnake.yy) * gameScale
        }
    }
};

function setAcceleration(mode) {
  if (playerSnake != null) playerSnake.wmd = mode == 1
}
window.oncontextmenu = function(e) {
  e.preventDefault();
  e.stopPropagation();
  return false
};
window.ontouchmove = function(e) {
  dmutm = timeObject.now() + 1500;
  if (playerSnake != null) {
    e = e || window.event;
    if (e) {
      var tchx, tchy;
      var t = e.touches[0];
      if (typeof t.clientX != "undefined") {
        mouseX = t.clientX - ww / 2;
        mouseY = t.clientY - hh / 2
      } else {
        mouseX = t.pageX - ww / 2;
        mouseY = t.pageY - hh / 2
      }
    }
  }
};
window[dfe](dfs);
var dmutm = 0;
var ltchx = -1;
var ltchy = -1;
var ltchmtm = -1;
window.ontouchstart = function(e) {
  dmutm = timeObject.now() + 1500;
  if (playerSnake != null) {
    e = e || window.event;
    if (e) {
      var tchx, tchy;
      var t = e.touches[0];
      if (typeof t.clientX != "undefined") {
        tchx = t.clientX - ww / 2;
        tchy = t.clientY - hh / 2
      } else {
        tchx = t.pageX - ww / 2;
        tchy = t.pageY - hh / 2
      }
      var mtm = timeObject.now();
      if (Math.abs(tchx - ltchx) < 24 && Math.abs(tchy - ltchy) < 24)
        if (mtm - ltchmtm < 400) setAcceleration(1);
      ltchx = tchx;
      ltchy = tchy;
      ltchmtm = mtm;
      mouseX = tchx;
      mouseY = tchy
    }
    e.preventDefault()
  }
};
window.onmousedown = function(e) {
  if (dmutm == 0 || timeObject.now() > dmutm) {
    dmutm = 0;
    if (playerSnake != null) {
      window.onmousemove(e);
      setAcceleration(1);
      e.preventDefault()
    }
  }
};
window.ontouchend = function() {
  setAcceleration(0)
};

function omu(e) {
  setAcceleration(0)
}
window.addEventListener("mouseup", omu);
var isAdmin = false;
var maxSegmentCountPerSnake = 0;
var fractionalLengthMultipliers = [];
var fpsLengthScores = [];
var elapsedTime = 0;
var webSocket = null;
var cstr = "c";
window.sendLogin = function(ba) {
  lgba = ba;
  if (wantSequence) {
    var a = new Uint8Array(1);
    a[0] = 2;
    webSocket.send(a);
    wantElapsedTimeSync = true
  } else if (!wantElapsedTimeSync) {
    var a = new Uint8Array(1);
    a[0] = 1;
    webSocket.send(a)
  }
  var len = cstr.length;
  var a = new Uint8Array(len + 1);
  for (var i = 0; i < len; i++) a[i] = cstr.charCodeAt(i);
  if (bestServer)
    if (bestServer.c_aa) {
      webSocket.send(bestServer.c_aa);
      return
    } webSocket.send(a)
};
var tcsecs = 0;
var tbytesPerSecond = 0;
var totalAvgPackets = 0;
var totalPackets = 0;
var avgPacketsPerSecond = 0;
var packetsPerSecond = 0;
var bytesPerSecond = 0;
var rframesPerSecond = 0;
var rnps = 0;
var rsps = 0;
var reps = 0;
var pkpspc = [];
var rdpspc = [];
var lastStatsResetTime = timeObject.now();
var locationUpdateTime = 0;
if (testing)
  for (var i = 0; i < 256; i++) {
    rdpspc[i] = 0;
    pkpspc[i] = 0
  }
var pfs = [];
var pft = 0;
var pf1 = 0;
var pf2 = 0;
var rpf1, rpf2;
var pf_nap = 0;
var pf_ep = 0;
var rpft = 0;
var pf;
for (var i = 0; i < 100; i++) pfs.push(0);
var pf_add = 0;
var pf_new_add = 0;
var pf_remove = 0;
var tpfa = new Float32Array(4E4);
for (var i = 0; i < tpfa.length; i++) tpfa[i] = Math.random() * 32;
var pfd;
if (testing) {
  pfd = document.createElement("div");
  pfd.style.position = "fixed";
  pfd.style.right = "4px";
  pfd.style.bottom = "209px";
  pfd.style.width = "270px";
  pfd.style.height = "594px";
  pfd.style.background = "rgba(0, 0, 0, .8)";
  pfd.style.color = "#80FF80";
  pfd.style.fontFamily = "Verdana";
  pfd.style.zIndex = 999999;
  pfd.style.fontSize = "11px";
  pfd.style.padding = "10px";
  pfd.style.borderRadius = "30px";
  pfd.textContent = "ayy lmao";
  document.body.appendChild(pfd)
}

function resetGameState() {
  if (webSocket) {
    webSocket.close();
    webSocket = null
  }
  wantCloseSocket = false;
  for (var i = allSnakes.length - 1; i >= 0; i--) deleteSnakeAtIndex(i);
  allSnakes = [];
  playerSnake = null;
  if (useWebGL)
    for (var i = foodsCount - 1; i >= 0; i--) deleteFood(allFoods[i]);
  allFoods = [];
  foodsCount = 0;
  if (useWebGL)
    for (var i = allPreys.length - 1; i >= 0; i--) deletePrey(allPreys[i]);
  allPreys = [];
  sectorList = [];
  os = {};
  rank = 0;
  best_rank = 999999999;
  slither_count = 0;
  biggest_slither_count = 0;
  isConnected = false;
  isPlaying = false;
  waitingForPong = false;
  isLagging = false;
  for (j = viewFrameCount - 1; j >= 0; j--) {
    followViewXs[j] = 0;
    followViewYs[j] = 0
  }
  followViewTarget = 0;
  followViewX = 0;
  followViewY = 0;
  lagMultiplier = 1;
  currentPingTime = 0;
  minimapAlpha = 0;
  minimapGotData = false;
  teamScoreboardAlpha = 0;
  teamScoreboardGotData = false;
  team1Score = 0;
  team2Score = 0;
  team1VisibleScore = 1;
  team2VisibleScore = 1;
  team1Scores = [];
  team2Scores = [];
  teamScorePosition = 0;
  scoreboardMinimap.style.display = "none";
  var ctx = arenaMinimapCanvas.getContext("2d");
  ctx.clearRect(0, 0, minimapSize, minimapSize);
  var ctx = arenaMinimapCanvas2.getContext("2d");
  ctx.clearRect(0, 0, minimapSize, minimapSize);
  gameScale = baseGameScale;
  for (var i = bgees.length - 1; i >= 0; i--) bgees[i].sc = gameScale * bgees[i].sp
}
var protocolVersion = 2;
var isConnecting = false;
var startConnectTime;
var playBtnClickTime = -1;
var waitingForServers = true;
var serversReadyAfterTime = -1;
var serversLoadedAtTime = -1;

function connectToServer() {
  if (waitingForServers)
    if (serversReadyAfterTime >= 0 && timeObject.now() > serversReadyAfterTime) waitingForServers = false;
    else if (serversLoadedAtTime >= 0 && timeObject.now() - serversLoadedAtTime > 7E3) waitingForServers = false;
  else return;
  resetGameState();
  wantPlay = false;
  isConnecting = true;
  startConnectTime = timeObject.now();
  forcedBestServer = null;
  if (!forcing) {
    recalcPingTimes();
    if (forcedBestServer != null) {
      bestServer = forcedBestServer;
      if (testing) {
        console.log("bso is fbso:");
        console.log(bestServer)
      }
    } else {
      serverList.sort(function(a, b) {
        return parseFloat(a.po) - parseFloat(b.po)
      });
      bestServer = serverList[Math.floor(Math.random() *
        serverList.length)];
      for (var i = serverList.length - 1; i >= 0; i--)
        if (!serverList[i].tainted)
          if (serverList[i].ptm <= bestServer.ptm)
            if (serverList[i].ac > 20) bestServer = serverList[i];
      if (testing) {
        console.log("bso is selected the old way:");
        console.log(bestServer)
      }
    }
  }
  if (forcing)
    if (forcedBestServerObj != null) bestServer = forcedBestServerObj;
  if (testing) {
    var es = "";
    if (forcedBestServer != null) es = "(fbso!)";
    console.log("connecting to " + bestServer.ip + ":" + bestServer.po + "... " + es)
  }
  webSocket = new WebSocket("ws://" + bestServer.ip + ":" + bestServer.po + "/slither");
  webSocket.binaryType = "arraybuffer";
  window.webSocket = webSocket;
  webSocket.onmessage = function(e) {
    if (webSocket != this) return;
    var a = new Uint8Array(e.data);
    bytesPerSecond += a.length;
    avgPacketsPerSecond++;
    if (wantSequence) {
      var seq = a[0] << 8 | a[1];
      if (seq - 1 != lastSequence)
        if (seq != 0)
          if (testing) console.log("sequence error! " + seq + " != " + lastSequence);
      lastSequence = seq
    } else if (wantElapsedTimeSync) {
      lastPingTime = currentPingTime;
      currentPingTime = timeObject.now();
      var etm_s = a[0] << 8 | a[1]
    }
    var m;
    var len;
    if (wantElapsedTimeSync) m = 2;
    else m = 0;
    if (a[m] < 32) {
      var l = a.length;
      while (m < l) {
        if (a[m] < 32) {
          len = a[m] << 8 | a[m + 1];
          m += 2
        } else {
          len = a[m] - 32;
          m++
        }
        var a2 = a.subarray(m, m + len);
        m += len;
        handlePacket(a2)
      }
    } else {
      var a2 = a.subarray(m, a.length);
      handlePacket(a2)
    }
  };
  window.handlePacket = function(a) {
    packetsPerSecond++;
    if (testing) {
      pkpspc[a[0]]++;
      rdpspc[a[0]] += a.length
    }
    var cmd;
    var cmd_v;
    var m;
    var alen, plen, dlen;
    cmd_v = a[0];
    cmd = String.fromCharCode(cmd_v);
    alen = a.length;
    plen = a.length;
    dlen = a.length - 1;
    m = 1;
    if (cmd == "a") {
      isConnecting = false;
      isConnected = true;
      isPlaying = true;
      if (forcedBestServerObj != null) {
        forcedBestServerObj = null;
        forcing = false
      }
      playBtnClickTime = -1;
      arenaSize = a[m] << 16 | a[m + 1] << 8 | a[m + 2];
      m += 3;
      var nmaxSegmentCountPerSnake = a[m] << 8 | a[m + 1];
      m += 2;
      sectorSize = a[m] << 8 | a[m + 1];
      sectorSizeDiv256 = sectorSize / 256;
      m += 2;
      sector_count_along_edge = a[m] << 8 | a[m + 1];
      m += 2;
      speedForFullTurn = a[m] / 10;
      m++;
      baseSpeed = (a[m] << 8 | a[m + 1]) / 100;
      m += 2;
      speedPerScale = (a[m] <<
        8 | a[m + 1]) / 100;
      m += 2;
      boostSpeed = (a[m] << 8 | a[m + 1]) / 100;
      m += 2;
      turnRatePerFrame = (a[m] << 8 | a[m + 1]) / 1E3;
      m += 2;
      turnRatePerFrame2 = (a[m] << 8 | a[m + 1]) / 1E3;
      m += 2;
      bodySmoothingConst = (a[m] << 8 | a[m + 1]) / 1E3;
      m += 2;
      if (m < alen) {
        protocolVersion = a[m];
        m++
      }
      if (m < alen) {
        defaultSegmentLength = a[m];
        m++
      }
      if (m < alen) {
        real_sid = a[m] << 8 | a[m + 1];
        m += 2
      } else real_sid = 0;
      if (m < alen) {
        fluxGradient = a[m] << 16 | a[m + 1] << 8 | a[m + 2];
        m += 3
      } else fluxGradient = arenaSize * .98;
      realFluxGradient = fluxGradient;
      for (var i = 0; i < fluxCount; i++) fluxGradients[i] = fluxGradient;
      team_mode = false;
      if (m < alen) {
        var game_mode = a[m];
        m++;
        team_mode = game_mode == 2
      }
      if (m < alen) {
        var extra_b =
          a[m];
        m++;
        if (team_mode) team_val = extra_b
      }
      if (team_mode) {
        if (!trumpImage) {
          trumpImage = document.createElement("img");
          trumpImage.style.opacity = 0;
          trumpImage.style.position = "absolute";
          setTransform(trumpImage, "scale(.5, .5)");
          setTransformOrigin(trumpImage, "0% 100%");
          trumpImage.style.left = teamScoreboardOffsetX + 82 + "px";
          trumpImage.style.bottom = teamScoreboardOffsetY + "px";
          trumpImage.onload = function() {
            trumpLoaded = true;
            trump_h = this.height
          };
          trumpImage.src = "http://slither.io/s/trump4.png";
          scoreboardMinimap.appendChild(trumpImage);
          kamalaImage = document.createElement("img");
          kamalaImage.style.opacity = 0;
          kamalaImage.style.position =
            "absolute";
          setTransform(kamalaImage, "scale(.5, .5)");
          setTransformOrigin(kamalaImage, "0% 100%");
          kamalaImage.style.left = teamScoreboardOffsetX + 10 + "px";
          kamalaImage.style.bottom = teamScoreboardOffsetY + "px";
          kamalaImage.onload = function() {
            kamalaLoaded = true
          };
          kamalaImage.src = "http://slither.io/s/kamala4.png";
          scoreboardMinimap.appendChild(kamalaImage)
        }
        leaderboardFooter.style.left = "210px";
        minimapState = .7
      } else {
        leaderboardFooter.style.left = "8px";
        minimapState = .475
      }
      reposLbf();
      recalcSeparationMultipliers();
      setMaxSegmentCountPerSnake(nmaxSegmentCountPerSnake);
      setMinimapSize(24, true);
      leaderboardHeader.style.display = "inline";
      leaderboardScores.style.display = "inline";
      leaderboardNames.style.display = "inline";
      leaderboardPositions.style.display = "inline";
      leaderboardFooter.style.display = "inline";
      victoryMessage.style.display = "inline";
      locationHolder.style.display = "inline";
      startShowGame()
    } else if (cmd == "e" || cmd == "E" || cmd == "3" || cmd == "4" || cmd == "5" || cmd == "d" || cmd == "7") {
      var o;
      var id = a[m] << 8 | a[m + 1];
      if (protocolVersion >= 14 && (cmd == "d" || cmd == "7" || dlen <= 2 && (cmd == "e" || cmd == "E" || cmd ==
          "3" || cmd == "4" || cmd == "5"))) o = playerSnake;
      else {
        var id = a[m] << 8 | a[m + 1];
        m += 2;
        o = os["s" + id]
      }
      var dir = -1;
      var ang = -1;
      var wang = -1;
      var speed = -1;
      if (protocolVersion >= 14)
        if (plen == 6) {
          if (cmd == "e") dir = 1;
          else dir = 2;
          ang = a[m] * 2 * Math.PI / 256;
          m++;
          wang = a[m] * 2 * Math.PI / 256;
          m++;
          speed = a[m] / 18;
          m++
        } else if (plen == 5 || plen == 3)
        if (cmd == "e") {
          ang = a[m] * 2 * Math.PI / 256;
          m++;
          speed = a[m] / 18;
          m++
        } else if (cmd == "E") {
        dir = 1;
        wang = a[m] * 2 * Math.PI / 256;
        m++;
        speed = a[m] / 18;
        m++
      } else if (cmd == "4") {
        dir = 2;
        wang = a[m] * 2 * Math.PI / 256;
        m++;
        speed = a[m] / 18;
        m++
      } else if (cmd == "3") {
        dir = 1;
        ang = a[m] * 2 * Math.PI / 256;
        m++;
        wang = a[m] * 2 * Math.PI / 256;
        m++
      } else {
        if (cmd == "5") {
          dir = 2;
          ang = a[m] * 2 * Math.PI / 256;
          m++;
          wang = a[m] * 2 * Math.PI / 256;
          m++
        }
      } else {
        if (plen == 4 || plen == 2)
          if (cmd == "e") {
            ang = a[m] * 2 * Math.PI / 256;
            m++
          } else if (cmd ==
          "E") {
          dir = 1;
          wang = a[m] * 2 * Math.PI / 256;
          m++
        } else if (cmd == "4") {
          dir = 2;
          wang = a[m] * 2 * Math.PI / 256;
          m++
        } else if (cmd == "3") {
          speed = a[m] / 18;
          m++
        } else if (cmd == "d") {
          dir = 1;
          ang = a[m] * 2 * Math.PI / 256;
          m++;
          wang = a[m] * 2 * Math.PI / 256;
          m++;
          speed = a[m] / 18;
          m++
        } else if (cmd == "7") {
          dir = 2;
          ang = a[m] * 2 * Math.PI / 256;
          m++;
          wang = a[m] * 2 * Math.PI / 256;
          m++;
          speed = a[m] / 18;
          m++
        }
      } else if (protocolVersion >= 6)
        if (plen == 6) {
          if (cmd == "e") dir = 1;
          else dir = 2;
          ang = a[m] * 2 * Math.PI / 256;
          m++;
          wang = a[m] * 2 * Math.PI / 256;
          m++;
          speed = a[m] / 18;
          m++
        } else if (plen == 5)
        if (cmd == "e") {
          ang = a[m] *
            2 * Math.PI / 256;
          m++;
          speed = a[m] / 18;
          m++
        } else if (cmd == "E") {
        dir = 1;
        wang = a[m] * 2 * Math.PI / 256;
        m++;
        speed = a[m] / 18;
        m++
      } else if (cmd == "4") {
        dir = 2;
        wang = a[m] * 2 * Math.PI / 256;
        m++;
        speed = a[m] / 18;
        m++
      } else if (cmd == "3") {
        dir = 1;
        ang = a[m] * 2 * Math.PI / 256;
        m++;
        wang = a[m] * 2 * Math.PI / 256;
        m++
      } else {
        if (cmd == "5") {
          dir = 2;
          ang = a[m] * 2 * Math.PI / 256;
          m++;
          wang = a[m] * 2 * Math.PI / 256;
          m++
        }
      } else {
        if (plen == 4)
          if (cmd == "e") {
            ang = a[m] * 2 * Math.PI / 256;
            m++
          } else if (cmd == "E") {
          dir = 1;
          wang = a[m] * 2 * Math.PI / 256;
          m++
        } else if (cmd == "4") {
          dir = 2;
          wang = a[m] * 2 * Math.PI / 256;
          m++
        } else if (cmd ==
          "3") {
          speed = a[m] / 18;
          m++
        }
      } else if (protocolVersion >= 3) {
        if (cmd != "3")
          if (plen == 8 || plen == 7 || plen == 6 && cmd != "3" || plen == 5 && cmd != "3")
            if (cmd == "e") dir = 1;
            else dir = 2;
        if (plen == 8 || plen == 7 || plen == 5 && cmd == "3" || plen == 6 && cmd == "3") {
          ang = (a[m] << 8 | a[m + 1]) * 2 * Math.PI / 65535;
          m += 2
        }
        if (plen == 8 || plen == 7 || plen == 5 && cmd != "3" || plen == 6 && cmd != "3") {
          wang = (a[m] << 8 | a[m + 1]) * 2 * Math.PI / 65535;
          m += 2
        }
        if (plen == 8 || plen == 6 || plen == 4) {
          speed = a[m] / 18;
          m++
        }
      } else {
        if (dlen == 11 || dlen == 8 || dlen == 9 || dlen == 6) {
          dir = a[m] - 48;
          m++
        }
        if (dlen == 11 || dlen == 7 || dlen == 9 || dlen ==
          5) {
          ang = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) * 2 * Math.PI / 16777215;
          m += 3
        }
        if (dlen == 11 || dlen == 8 || dlen == 9 || dlen == 6) {
          wang = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) * 2 * Math.PI / 16777215;
          m += 3
        }
        if (dlen == 11 || dlen == 7 || dlen == 8 || dlen == 4) {
          speed = (a[m] << 8 | a[m + 1]) / 1E3;
          m += 2
        }
      }
      if (o) {
        if (dir != -1) o.direction = dir;
        if (ang != -1) {
          var da = (ang - o.currentAngle) % TWO_PI;
          if (da < 0) da += TWO_PI;
          if (da > Math.PI) da -= TWO_PI;
          var k = o.interpAnglepos;
          for (var j = 0; j < angleFrameCount; j++) {
            o.interpAngles[k] -= da * angleInterpFactors[j];
            k++;
            if (k >= angleFrameCount) k = 0
          }
          o.interpAngletg = angleFrameCount;
          o.currentAngle = ang
        }
        if (wang != -1) {
          o.serverAngle = wang;
          if (o != playerSnake) o.targetAngle = wang
        }
        if (speed != -1) {
          o.speed = speed;
          o.speedeedAngleFactor = o.speed / speedForFullTurn;
          if (o.speedeedAngleFactor > 1) o.speedeedAngleFactor = 1
        }
      }
    } else if (cmd == "6") {
      var s = "";
      while (m < alen) {
        s += String.fromCharCode(a[m]);
        m++
      }
      handleServerVersion(s)
    } else if (cmd == "h") {
      var id = a[m] << 8 | a[m + 1];
      m += 2;
      var fam = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) / 16777215;
      m += 3;
      var o = os["s" + id];
      if (o) {
        o.fractionalLength = fam;
        snakeLength(o)
      }
    } else if (cmd == "r") {
      var id = a[m] << 8 | a[m + 1];
      m += 2;
      var o = os["s" + id];
      if (o) {
        if (dlen >= 4) {
          o.fractionalLength = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) / 16777215;
          m += 3
        }
        for (var j = 0; j < o.bodyPoints.length; j++)
          if (!o.bodyPoints[j].dying) {
            o.bodyPoints[j].dying = true;
            o.segmentCount--;
            o.scale = Math.min(6, 1 +
              (o.segmentCount - 2) / 106);
            o.scalealeAngleFactor = .13 + .87 * Math.pow((7 - o.scale) / 6, 2);
            o.ssp = baseSpeed + speedPerScale * o.scale;
            o.fsp = o.ssp + .1;
            o.widthSeparation = 6 * o.scale;
            var mwsep = minSegmentSpacing / gameScale;
            if (o.widthSeparation < mwsep) o.widthSeparation = mwsep;
            break
          } snakeLength(o)
      }
    } else if (cmd == "R") {
      playerSnake.rsc = a[m];
      m++
    } else if (cmd == "B") {
      if (testing) {
        var id = a[m] << 8 | a[m + 1];
        m += 2;
        o = os["s" + id];
        xx = a[m] << 8 | a[m + 1];
        m += 2;
        yy = a[m] << 8 | a[m + 1];
        m += 2;
        var sct_c = a[m];
        m++;
        if (xx != o.lpo_xx || yy != o.lpo_yy) {
          var dx = xx - o.lpo_xx;
          var dy = yy - o.lpo_yy;
          if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
            dx = Math.round(dx * 100) / 100;
            dy = Math.round(dy * 100) / 100;
            if (o ==
              playerSnake) console.log("invalid new point delta for self: " + dx + " " + dy + " (" + o.lpo_cmd +
              ", prev " + o.lpo_prev_cmd + ") (sct " + o.segmentCount + " " + sct_c + ") " + o.lpo_dd);
            else console.log("invalid new point delta for " + o.nk + ": " + dx + " " + dy + " (" + o.lpo_cmd +
              ", prev " + o.lpo_prev_cmd + ") (sct " + o.segmentCount + " " + sct_c + ") " + o.lpo_dd)
          }
        }
      }
    } else if (cmd == "g" || cmd == "n" || cmd == "G" || cmd == "N" || cmd == "+" || cmd == "=") {
      if (!isPlaying) return;
      var adding_only = cmd == "n" || cmd == "N" || cmd == "+";
      var o;
      if (protocolVersion >= 15)
        if (cmd == "G" || cmd == "N" || cmd == "=" && dlen ==
          6 || cmd == "+" && dlen == 9) o = playerSnake;
        else {
          var id = a[m] << 8 | a[m + 1];
          m += 2;
          o = os["s" + id]
        }
      else if (cmd == "g" && dlen == 4 || cmd == "G" && dlen == 2 || cmd == "n" && dlen == 7 || cmd == "N" && dlen ==
        5) o = playerSnake;
      else {
        var id = a[m] << 8 | a[m + 1];
        m += 2;
        o = os["s" + id]
      }
      if (o) {
        if (adding_only) o.segmentCount++;
        else
          for (var j = 0; j < o.bodyPoints.length; j++)
            if (!o.bodyPoints[j].dying) {
              o.bodyPoints[j].dying = true;
              break
            } var lastPoint = o.bodyPoints[o.bodyPoints.length - 1];
        var movedPoint;
        var mv;
        var lastMovedPoint;
        var dx, dy, ox, oy;
        var dltn;
        var dsmu;
        var osmu;
        var d;
        var po = pointsDeadpool.get();
        if (!po) {
          po = {};
          po.segmentInterpXs = new Float32Array(headFrameCount);
          po.segmentInterpYs =
            new Float32Array(headFrameCount);
          po.segmentFltns = new Float32Array(headFrameCount);
          po.interpSeparationMults = new Float32Array(headFrameCount)
        } else
          for (var i = headFrameCount - 1; i >= 0; i--) {
            po.segmentInterpXs[i] = 0;
            po.segmentInterpYs[i] = 0;
            po.segmentFltns[i] = 0;
            po.interpSeparationMults[i] = 0
          }
        var msl = o.segmentLength;
        if (protocolVersion >= 15)
          if (cmd == "+" || cmd == "=") {
            var iang = a[m] << 8 | a[m + 1];
            po.segmentInitialAngle = iang;
            m += 2;
            xx = a[m] << 8 | a[m + 1];
            m += 2;
            yy = a[m] << 8 | a[m + 1];
            m += 2
          } else {
            var iang;
            if (cmd == "G" && dlen == 2 || cmd == "N" && dlen == 5 || cmd == "g" && dlen == 4 || cmd == "n" && dlen ==
              7) {
              iang = a[m] << 8 | a[m + 1];
              m += 2
            } else iang = lastPoint.segmentInitialAngle;
            po.segmentInitialAngle = iang;
            var ang = iang * FIXED_POINT_TO_RAD;
            xx = lastPoint.segmentX + Math.cos(ang) *
              msl;
            yy = lastPoint.segmentY + Math.sin(ang) * msl
          }
        else if (protocolVersion >= 3)
          if (cmd == "g" || cmd == "n") {
            xx = a[m] << 8 | a[m + 1];
            m += 2;
            yy = a[m] << 8 | a[m + 1];
            m += 2
          } else {
            xx = lastPoint.segmentX + a[m] - 128;
            m++;
            yy = lastPoint.segmentY + a[m] - 128;
            m++
          }
        else {
          xx = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) / 5;
          m += 3;
          yy = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) / 5;
          m += 3
        }
        if (adding_only) {
          o.fractionalLength = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) / 16777215;
          m += 3
        }
        po.fpos = 0;
        po.ftg = 0;
        po.segmentSmu = 1;
        po.interpSeparationMult = 0;
        po.segmentX = xx;
        po.segmentY = yy;
        po.segmentInterpX = 0;
        po.segmentInterpY = 0;
        po.segmentFltn = 0;
        po.segmentDa = 0;
        po.segmentLengthRatio = Math.sqrt(Math.pow(po.segmentX - lastPoint.segmentX, 2) + Math.pow(po.segmentY -
          lastPoint.segmentY, 2)) / msl;
        po.segmentEbx = po.segmentX - lastPoint.segmentX;
        po.segmentEby = po.segmentY - lastPoint.segmentY;
        o.bodyPoints.push(po);
        if (o.isInView) {
          var hx = o.headX + o.interpOffsetX;
          var hy = o.headY + o.interpOffsetY;
          dx = hx - (lastPoint.segmentX + lastPoint.segmentInterpX);
          dy = hy - (lastPoint.segmentY + lastPoint.segmentInterpY);
          d = Math.sqrt(dx * dx + dy * dy);
          if (d > 1) {
            dx /= d;
            dy /= d
          }
          d2 = po.segmentLengthRatio * msl;
          if (d < msl) d3 = d;
          else d3 = d2;
          ox = lastPoint.segmentX + lastPoint.segmentInterpX + dx * d3;
          oy = lastPoint.segmentY + lastPoint.segmentInterpY + dy * d3;
          dltn = 1 - d3 / d2;
          dx = po.segmentX - ox;
          dy = po.segmentY - oy;
          var k = po.fpos;
          for (var j = 0; j < headFrameCount; j++) {
            po.segmentInterpXs[k] -= dx * headInterpFactors[j];
            po.segmentInterpYs[k] -= dy * headInterpFactors[j];
            po.segmentFltns[k] -= dltn * headInterpFactors[j];
            k++;
            if (k >= headFrameCount) k = 0
          }
          po.segmentInterpX = po.segmentInterpXs[po.fpos];
          po.segmentInterpY = po.segmentInterpYs[po.fpos];
          po.segmentFltn = po.segmentFltns[po.fpos];
          po.interpSeparationMult = po.interpSeparationMults[po.fpos];
          po.ftg = headFrameCount
        }
        lastPoint = po;
        var n2 = 3;
        var k = o.bodyPoints.length - 3;
        if (k >= 1) {
          lastMovedPoint = o.bodyPoints[k];
          n = 0;
          mv = 0;
          dsmu = 0;
          for (var m = k - 1; m >= 0; m--) {
            movedPoint = o.bodyPoints[m];
            n++;
            ox = movedPoint.segmentX;
            oy = movedPoint.segmentY;
            osmu = movedPoint.segmentSmu;
            if (n <= 4) mv = bodySmoothingConst * n / 4;
            movedPoint.segmentX += (lastMovedPoint.segmentX - movedPoint.segmentX) * mv;
            movedPoint.segmentY += (lastMovedPoint.segmentY - movedPoint.segmentY) * mv;
            if (movedPoint.segmentSmu != separationMultipliers[n2]) {
              osmu = movedPoint.segmentSmu;
              movedPoint.segmentSmu = separationMultipliers[n2];
              dsmu = movedPoint.segmentSmu - osmu
            } else dsmu = 0;
            if (n2 < smusCountMinus3) n2++;
            if (o.isInView) {
              dx = movedPoint.segmentX - ox;
              dy = movedPoint.segmentY - oy;
              var k = movedPoint.fpos;
              for (var j = 0; j < headFrameCount; j++) {
                movedPoint.segmentInterpXs[k] -= dx * headInterpFactors[j];
                movedPoint.segmentInterpYs[k] -= dy * headInterpFactors[j];
                movedPoint.interpSeparationMults[k] -= dsmu * headInterpFactors[j];
                k++;
                if (k >= headFrameCount) k = 0
              }
              movedPoint.segmentInterpX =
                movedPoint.segmentInterpXs[movedPoint.fpos];
              movedPoint.segmentInterpY = movedPoint.segmentInterpYs[movedPoint.fpos];
              movedPoint.interpSeparationMult = movedPoint.interpSeparationMults[movedPoint.fpos];
              movedPoint.ftg = headFrameCount
            }
            lastMovedPoint = movedPoint
          }
        }
        o.scale = Math.min(6, 1 + (o.segmentCount - 2) / 106);
        o.scalealeAngleFactor = .13 + .87 * Math.pow((7 - o.scale) / 6, 2);
        o.ssp = baseSpeed + speedPerScale * o.scale;
        o.fsp = o.ssp + .1;
        o.widthSeparation = 6 * o.scale;
        var mwsep = minSegmentSpacing / gameScale;
        if (o.widthSeparation < mwsep) o.widthSeparation = mwsep;
        if (adding_only) snakeLength(o);
        if (o == playerSnake) {
          oldViewX = playerSnake.xx + playerSnake.fx;
          oldViewY = playerSnake.yy + playerSnake.fy
        }
        var csp = o.speed * (elapsedTime / 8) / 4;
        csp *= lagMultiplier;
        var ochl = o.chainLength - 1;
        o.chainLength = csp / o.segmentLength;
        var dx = xx - o.headX;
        var dy = yy - o.headY;
        var dchl = o.chainLength - ochl;
        o.headX = xx;
        o.headY = yy;
        var k = o.fpos;
        for (var j = 0; j < rightFrameCount; j++) {
          o.interpOffsetXs[k] -= dx * rightInterpFactors[j];
          o.interpOffsetYs[k] -= dy * rightInterpFactors[j];
          o.interpLengths[k] -= dchl * rightInterpFactors[j];
          k++;
          if (k >= rightFrameCount) k = 0
        }
        o.interpOffsetX = o.interpOffsetXs[o.fpos];
        o.interpOffsetY = o.interpOffsetYs[o.fpos];
        o.interpLength = o.interpLengths[o.fpos];
        o.ftg = rightFrameCount;
        o.eyeLength = 0;
        if (o == playerSnake) {
          var lvx = viewX;
          var lvy = viewY;
          if (follow_view) {
            viewX = playerSnake.xx + playerSnake.fx;
            viewY = playerSnake.yy + playerSnake.fy
          }
          bgx2 -= (viewX - lvx) * 1 / bgw2;
          bgy2 -= (viewY - lvy) * 1 / bgh2;
          bgx2 %= 1;
          if (bgx2 < 0) bgx2 += 1;
          bgy2 %= 1;
          if (bgy2 < 0) bgy2 += 1;
          var dx = viewX - oldViewX;
          var dy = viewY - oldViewY;
          var k = followViewPos;
          for (var j = 0; j < viewFrameCount; j++) {
            followViewXs[k] -= dx *
              viewFadeFactors[j];
            followViewYs[k] -= dy * viewFadeFactors[j];
            k++;
            if (k >= viewFrameCount) k = 0
          }
          followViewTarget = viewFrameCount
        }
      }
    } else if (cmd == "l") {
      if (!isPlaying) return;
      wantUpdateLeaderboard = true;
      var s_htm = "";
      var n_htm = "";
      var p_htm = "";
      var nc = 0;
      var pos = 0;
      if (leaderboardFade == -1)
        if (deadTime == -1) leaderboardFade = 0;
      var k, v;
      var score;
      var my_pos = a[m];
      m++;
      rank = a[m] << 8 | a[m + 1];
      if (rank < best_rank) best_rank = rank;
      m += 2;
      slither_count = a[m] << 8 | a[m + 1];
      if (slither_count > biggest_slither_count) biggest_slither_count = slither_count;
      m += 2;
      while (m < alen) {
        var sct;
        var fam;
        sct = a[m] << 8 | a[m + 1];
        m += 2;
        fam = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) / 16777215;
        m += 3;
        score = Math.floor((fpsLengthScores[sct] + fam / fractionalLengthMultipliers[sct] - 1) * 15 - 5) / 1;
        var cv = a[m] % 9;
        m++;
        var nl = a[m];
        m++;
        pos++;
        var nk = "";
        for (var j = 0; j < nl; j++) {
          v = a[m];
          nk += String.fromCharCode(v);
          m++
        }
        if (pos == my_pos) {
          nk = myNickname;
          nl = nk.length
        } else if (!isValidNickname(nk)) nk = "";
        var nk2 = "";
        for (var j = 0; j < nl; j++) {
          v = nk.charCodeAt(j);
          if (v == 38) nk2 += "&amp;";
          else if (v == 60) nk2 += "&lt;";
          else if (v == 62) nk2 += "&gt;";
          else if (v == 32) nk2 += "&nbsp;";
          else nk2 += String.fromCharCode(v)
        }
        nk = nk2;
        nc++;
        if (pos == my_pos) k = 1;
        else k = .7 * (.3 + .7 * (1 - nc / 10));
        s_htm += '<span style="opacity:' +
          k + "; color:" + per_color_imgs[cv].cs + ';">' + score + "</span><BR>";
        n_htm += '<span style="opacity:' + k + "; color:" + per_color_imgs[cv].cs + ";" + (pos == my_pos ?
          "font-weight:bold;" : "") + '">' + nk + "</span><BR>";
        p_htm += '<span style="opacity:' + k + "; color:" + per_color_imgs[cv].cs + ';">#' + nc + "</span><BR>"
      }
      leaderboardScores.innerHTML = s_htm;
      leaderboardNames.innerHTML = n_htm;
      leaderboardPositions.innerHTML = p_htm
    } else if (cmd == "v")
      if (a[m] == 2) {
        wantCloseSocket = true;
        wantVictoryMessage = false;
        wantHideVictory = 1;
        hideVictoryFade = 0
      } else {
        deadTime = timeObject.now();
        playButton.setEnabled(true);
        var sct =
          playerSnake.sct + playerSnake.rsc;
        var final_score = Math.floor((fpsLengthScores[sct] + playerSnake.fam / fractionalLengthMultipliers[sct] - 1) *
          15 - 5) / 1;
        var fstr = "Your final length was";
        if (lang == "de") fstr = "Deine endg\u00fcltige L\u00e4nge war";
        else if (lang == "fr") fstr = "Votre longueur finale \u00e9tait de";
        else if (lang == "pt") fstr = "Seu comprimento final foi de";
        var exc = "";
        if (final_score > 1E3) exc = "!";
        var s = '<span style="opacity: .45;">' + fstr + " </span><b>" + final_score + "</b>" + exc;
        lastScoreElement.innerHTML = s;
        var pstr = "Play Again";
        if (lang == "fr") pstr = "Jouer";
        else if (lang ==
          "pt") pstr = "Joga";
        playButton.setText(String.fromCharCode(160) + pstr + String.fromCharCode(160));
        if (a[m] == 1) {
          nicknameHolder.style.display = "none";
          playHolder.style.display = "none";
          skinMenuHolder.style.display = "none";
          victoryHolder.style.display = "inline";
          saveHolder.style.display = "block";
          wantVictoryMessage = true;
          wantVictoryFocus = true;
          victoryInput.disabled = false;
          saveButton.setEnabled(true)
        } else wantCloseSocket = true
      }
    else if (cmd == "W") {
      xx = a[m];
      m++;
      yy = a[m];
      m++;
      var o = {};
      o.headX = xx;
      o.headY = yy;
      sectorList.push(o)
    } else if (cmd == "w") {
      var mode;
      if (protocolVersion >=
        8) {
        mode = 2;
        xx = a[m];
        m++;
        yy = a[m];
        m++
      } else {
        mode = a[m];
        m++;
        xx = a[m] << 8 | a[m + 1];
        m += 2;
        yy = a[m] << 8 | a[m + 1];
        m += 2
      }
      if (mode == 1) {
        var o = {};
        o.headX = xx;
        o.headY = yy;
        sectorList.push(o)
      } else {
        cm1 = foodsCount - 1;
        for (var i = cm1; i >= 0; i--) {
          var fo = allFoods[i];
          if (fo.sx == xx)
            if (fo.sy == yy) {
              if (useWebGL) deleteFood(fo);
              if (i == cm1) {
                allFoods[i] = null;
                foodsCount--;
                cm1--
              } else {
                allFoods[i] = allFoods[cm1];
                allFoods[cm1] = null;
                foodsCount--;
                cm1--
              }
            }
        }
        for (var i = sectorList.length - 1; i >= 0; i--) {
          var o = sectorList[i];
          if (o.headX == xx)
            if (o.headY == yy) sectorList.splice(i, 1)
        }
      }
    } else if (cmd == "m") {
      var sct = a[m] << 16 | a[m + 1] <<
        8 | a[m + 2];
      m += 3;
      var fam = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) / 16777215;
      m += 3;
      var victory_score = Math.floor((fpsLengthScores[sct] + fam / fractionalLengthMultipliers[sct] - 1) * 15 - 5) /
      1;
      var nl = a[m];
      m++;
      var victory_nicknameInput = "";
      for (var i = 0; i < nl; i++) {
        victory_nicknameInput += String.fromCharCode(a[m]);
        m++
      }
      if (!isValidNickname(victory_nicknameInput)) victory_nicknameInput = "";
      var victory_message = "";
      while (m < alen) {
        victory_message += String.fromCharCode(a[m]);
        m++
      }
      if (!isValidNickname(victory_message)) victory_message = "";
      victory_nicknameInput = victory_nicknameInput.split("&").join("&amp;").split("<").join("&lt;").split(">").join(
        "&gt;");
      victory_message =
        victory_message.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
      if (victory_score > 0) {
        var h = "";
        if (victory_message.length > 0) h +=
          "<span style='font-size:17px;'><b><i><span style='opacity: .5;'>&quot;</span>" + victory_message +
          "<span style='opacity: .5;'>&quot;</span></i></b></span><BR><div style='height: 5px;'></div>";
        if (victory_nicknameInput.length > 0) {
          if (victory_message.length > 0) h +=
            "<i><span style='opacity: .5;'>- </span><span style='opacity: .75;'><b>" + victory_nicknameInput +
            "</b></span><span style='opacity: .5;'>, today's longest</span></i>";
          else h = "<i><span style='opacity: .5;'>Today's longest was </span><span style='opacity: .75;'><b>" +
            victory_nicknameInput + "</b></span></i>";
          h += "<br><i><span style='opacity: .5;'>with a length of </span><span style='opacity: .65;'><b>" +
            victory_score + "</b></span></i>"
        } else if (victory_message.length > 0) {
          h += "<i><span style='opacity: .5;'>- </span><span style='opacity: .5;'>today's longest</span></i>";
          h += "<br><i><span style='opacity: .5;'>with a length of </span><span style='opacity: .65;'><b>" +
            victory_score + "</b></span></i>"
        } else h +=
          "<i><span style='opacity: .5;'>Today's longest: </span><span style='opacity: .75;'><b>" + victory_score +
          "</b></span></i>";
        victoryMessage.innerHTML = h
      }
    } else if (cmd == "p") {
      if (testing) console.log("ping: " + Math.round(timeObject.now() - lastPingSendTime));
      waitingForPong = false;
      if (isLagging) {
        elapsedTime *= lagMultiplier;
        isLagging = false
      }
    } else if (cmd == "U") {
      var sz = a[m] << 8 | a[m + 1];
      m += 2;
      if (sz > 512) sz = 512;
      if (minimapSize != sz) setMinimapSize(sz, false);
      if (!minimapGotData) {
        var ctx = arenaMinimapCanvas.getContext("2d");
        ctx.clearRect(0, 0, minimapSize, minimapSize);
        ctx.drawImage(arenaMinimapCanvas2, 0, 0)
      }
      minimapBlendFrame = 0;
      arenaMinimapCanvas.style.opacity = minimapState;
      arenaMinimapCanvas2.style.opacity =
        0;
      var ctx = arenaMinimapCanvas2.getContext("2d");
      ctx.clearRect(0, 0, minimapSize, minimapSize);
      ctx.fillStyle = "#FFFFFF";
      var i;
      var k = 0;
      var xx = minimapSize - 1;
      var yy = minimapSize - 1;
      while (m < alen) {
        if (yy < 0) break;
        k = a[m++];
        if (k >= 128) {
          k -= 128;
          for (i = 0; i < k; i++) {
            xx--;
            if (xx < 0) {
              xx = minimapSize - 1;
              yy--;
              if (yy < 0) break
            }
          }
        } else
          for (i = 0; i < 7; i++) {
            if ((k & u_m[i]) > 0) ctx.fillRect(xx, yy, 1, 1);
            xx--;
            if (xx < 0) {
              xx = minimapSize - 1;
              yy--;
              if (yy < 0) break
            }
          }
      }
      if (!minimapGotData) {
        minimapGotData = true;
        var ctx = arenaMinimapCanvas.getContext("2d");
        ctx.clearRect(0, 0, minimapSize, minimapSize);
        ctx.drawImage(arenaMinimapCanvas2, 0, 0)
      }
    } else if (cmd == "L") {
      var team_count = a[m++];
      var sz =
        a[m] << 8 | a[m + 1];
      m += 2;
      if (sz > 512) sz = 512;
      if (minimapSize != sz) setMinimapSize(sz, false);
      if (minimapGotData) {
        var ctx = arenaMinimapCanvas.getContext("2d");
        ctx.clearRect(0, 0, minimapSize, minimapSize);
        ctx.drawImage(arenaMinimapCanvas2, 0, 0)
      }
      minimapBlendFrame = 0;
      arenaMinimapCanvas.style.opacity = minimapState;
      arenaMinimapCanvas2.style.opacity = 0;
      var ctx = arenaMinimapCanvas2.getContext("2d");
      ctx.clearRect(0, 0, minimapSize, minimapSize);
      if (team_count == 2) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = "#FF8080"
      } else ctx.fillStyle = "#FFFFFF";
      var i, j, k;
      var xx, yy;
      for (j = 1; j <= team_count; j++) {
        if (j == 2) ctx.fillStyle = "#99AAFF";
        k = 0;
        xx = minimapSize - 1;
        yy = minimapSize -
          1;
        while (m < alen) {
          if (yy < 0) break;
          k = a[m++];
          if (k >= 128) {
            if (k == 255) k = 126 * a[m++];
            else k -= 128;
            for (i = 0; i < k; i++) {
              xx--;
              if (xx < 0) {
                xx = minimapSize - 1;
                yy--;
                if (yy < 0) break
              }
            }
          } else
            for (i = 0; i < 7; i++) {
              if ((k & u_m[i]) > 0) ctx.fillRect(xx, yy, 1, 1);
              xx--;
              if (xx < 0) {
                xx = minimapSize - 1;
                yy--;
                if (yy < 0) break
              }
            }
        }
      }
      if (!minimapGotData) {
        minimapGotData = true;
        var ctx = arenaMinimapCanvas.getContext("2d");
        ctx.clearRect(0, 0, minimapSize, minimapSize);
        ctx.drawImage(arenaMinimapCanvas2, 0, 0)
      }
    } else if (cmd == "M") {
      var sz = a[m] << 8 | a[m + 1];
      m += 2;
      if (sz > 512) sz = 512;
      if (minimapSize != sz) setMinimapSize(sz, false);
      minimapData.fill(0);
      if (minimapGotData) {
        var ctx = arenaMinimapCanvas.getContext("2d");
        ctx.clearRect(0, 0, minimapSize, minimapSize);
        ctx.drawImage(arenaMinimapCanvas2, 0, 0)
      }
      minimapBlendFrame = 0;
      arenaMinimapCanvas.style.opacity = minimapState;
      arenaMinimapCanvas2.style.opacity = 0;
      var ctx = arenaMinimapCanvas2.getContext("2d");
      ctx.clearRect(0, 0, minimapSize, minimapSize);
      ctx.fillStyle = "#FFFFFF";
      var i;
      var k = 0;
      var xx = minimapSize - 1;
      var yy = minimapSize - 1;
      while (m < alen) {
        if (yy < 0) break;
        k = a[m++];
        if (k >= 128) {
          if (k == 255) k = 126 * a[m++];
          else k -= 128;
          for (i = 0; i < k; i++) {
            xx--;
            if (xx < 0) {
              xx = minimapSize - 1;
              yy--;
              if (yy < 0) break
            }
          }
        } else
          for (i = 0; i < 7; i++) {
            if ((k & u_m[i]) > 0) {
              minimapData[yy * minimapSize + xx] = 1;
              ctx.fillRect(xx, yy, 1, 1)
            }
            xx--;
            if (xx < 0) {
              xx = minimapSize - 1;
              yy--;
              if (yy < 0) break
            }
          }
      }
      if (!minimapGotData) {
        minimapGotData =
          true;
        var ctx = arenaMinimapCanvas.getContext("2d");
        ctx.clearRect(0, 0, minimapSize, minimapSize);
        ctx.drawImage(arenaMinimapCanvas2, 0, 0)
      }
    } else if (cmd == "V") {
      if (minimapGotData) {
        var ctx = arenaMinimapCanvas.getContext("2d");
        ctx.clearRect(0, 0, minimapSize, minimapSize);
        ctx.drawImage(arenaMinimapCanvas2, 0, 0)
      }
      minimapBlendFrame = 0;
      arenaMinimapCanvas.style.opacity = minimapState;
      arenaMinimapCanvas2.style.opacity = 0;
      var ctx = arenaMinimapCanvas2.getContext("2d");
      ctx.fillStyle = "#FFFFFF";
      var i;
      var j;
      var k = 0;
      var xx = minimapSize - 1;
      var yy = minimapSize - 1;
      while (m < alen) {
        if (yy < 0) break;
        k = a[m++];
        if (k >= 128) {
          if (k == 255) k = 126 * a[m++];
          else k -= 128;
          for (i = 0; i < k; i++) {
            xx--;
            if (xx < 0) {
              xx = minimapSize - 1;
              yy--;
              if (yy < 0) break
            }
          }
        } else
          for (i =
            0; i < 7; i++) {
            if ((k & u_m[i]) > 0) {
              j = yy * minimapSize + xx;
              if (minimapData[j] == 1) {
                minimapData[j] = 0;
                ctx.clearRect(xx, yy, 1, 1)
              } else {
                minimapData[j] = 1;
                ctx.fillRect(xx, yy, 1, 1)
              }
            }
            xx--;
            if (xx < 0) {
              xx = minimapSize - 1;
              yy--;
              if (yy < 0) break
            }
          }
      }
      if (!minimapGotData) {
        minimapGotData = true;
        var ctx = arenaMinimapCanvas.getContext("2d");
        ctx.clearRect(0, 0, minimapSize, minimapSize);
        ctx.drawImage(arenaMinimapCanvas2, 0, 0)
      }
    } else if (cmd == "u") {
      minimapGotData = true;
      if (minimapSize != 80) setMinimapSize(80, true);
      var ctx = arenaMinimapCanvas.getContext("2d");
      ctx.clearRect(0, 0, 80, 80);
      ctx.fillStyle = "#FFFFFF";
      var i;
      var k = 0;
      var xx = 0;
      var yy = 0;
      while (m < alen) {
        if (yy >= 80) break;
        k = a[m++];
        if (k >= 128) {
          k -= 128;
          for (i = 0; i < k; i++) {
            xx++;
            if (xx >= 80) {
              xx = 0;
              yy++;
              if (yy >= 80) break
            }
          }
        } else
          for (i = 0; i < 7; i++) {
            if ((k & u_m[i]) > 0) ctx.fillRect(xx, yy, 1, 1);
            xx++;
            if (xx >= 80) {
              xx = 0;
              yy++;
              if (yy >= 80) break
            }
          }
      }
    } else if (cmd == "i") {
      isAdmin = true;
      var mode = a[m];
      m++;
      var id = a[m] << 8 | a[m + 1];
      m += 2;
      var o = os["s" + id];
      if (o)
        if (mode == 0) {
          var v1 = a[m];
          m++;
          var v2 = a[m];
          m++;
          var v3 = a[m];
          m++;
          var v4 = a[m];
          m++;
          if (v1 > 0 || v2 > 0 || v3 > 0 || v4 > 0) {
            var ipstr = v1 + "." + v2 + "." + v3 + "." + v4;
            o.ip = ipstr
          }
        } else if (mode == 1) {
        var nk = "";
        while (m < alen) {
          nk += String.fromCharCode(a[m]);
          m++
        }
        o.onk =
          nk
      }
    } else if (cmd == "o") {
      team1Score = 0;
      team2Score = 0;
      if (alen == 9) {
        team1Score = a[m] << 24 | a[m + 1] << 16 | a[m + 2] << 8 | a[m + 3];
        m += 4;
        team2Score = a[m] << 24 | a[m + 1] << 16 | a[m + 2] << 8 | a[m + 3];
        m += 4;
        teamScorePosition++;
        if (teamScorePosition >= team1Scores.length) teamScorePosition = 0;
        team1Scores[teamScorePosition] = team1Score;
        team2Scores[teamScorePosition] = team2Score
      } else {
        while (m < alen) {
          team1Score = a[m] << 24 | a[m + 1] << 16 | a[m + 2] << 8 | a[m + 3];
          m += 4;
          team2Score = a[m] << 24 | a[m + 1] << 16 | a[m + 2] << 8 | a[m + 3];
          m += 4;
          team1Scores.unshift(team1Score);
          team2Scores.unshift(team2Score)
        }
        teamScorePosition =
          team1Scores.length - 1;
        team1Score = team1Scores[teamScorePosition];
        team2Score = team2Scores[teamScorePosition]
      }
      if (!teamScoreboardGotData) {
        teamScoreboardGotData = true;
        teamScoreboardGotDataTime = timeObject.now();
        scoreboardMinimap.style.display = "inline"
      }
      var h1, h2;
      if (team1Score + team2Score > 0) {
        team1EaseOut.s(team1Score / (team1Score + team2Score));
        team2EaseOut.s(team2Score / (team1Score + team2Score));
        h1 = Math.round(100 * team1Score / (team1Score + team2Score)) / 1;
        h2 = 100 - h1;
        team1Percent.textContent = h1 + "%";
        team2Percent.textContent = h2 + "%"
      }
      if (testing) {
        console.log("team 1 score: " + team1Score);
        console.log("team 2 score: " + team2Score)
      }
    } else if (cmd == "s") {
      if (!isPlaying) return;
      var id = a[m] << 8 | a[m + 1];
      m += 2;
      if (dlen > 6) {
        var ang = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) * 2 * Math.PI / 16777215;
        m += 3;
        var dir = a[m] - 48;
        m++;
        var wang = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) * 2 * Math.PI / 16777215;
        m += 3;
        var speed = (a[m] << 8 | a[m + 1]) / 1E3;
        m += 2;
        var fam = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) / 16777215;
        m += 3;
        var cv = a[m];
        m++;
        var pts = [];
        var snx = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) / 5;
        m += 3;
        var sny = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) / 5;
        m += 3;
        var nl = a[m];
        m++;
        var nk = "";
        for (var j = 0; j < nl; j++) {
          nk +=
            String.fromCharCode(a[m]);
          m++
        }
        if (testing) console.log("nk: " + nk);
        var custom_skin = null;
        if (protocolVersion >= 11) {
          var skl = a[m];
          m++;
          if (skl > 0) {
            custom_skin = new Uint8Array(skl);
            for (var j = 0; j < skl; j++) custom_skin[j] = a[m + j]
          }
          m += skl
        }
        var cosmetic = 255;
        if (protocolVersion >= 12) {
          cosmetic = a[m];
          m++
        }
        var msl = defaultSegmentLength;
        xx = 0;
        yy = 0;
        var lx = 0;
        var ly = 0;
        var fp = false;
        var k = 1;
        var po = null;
        var alen_m2 = alen - 2;
        while (m < alen) {
          po = pointsDeadpool.get();
          if (!po) {
            po = {};
            po.segmentInterpXs = new Float32Array(headFrameCount);
            po.segmentInterpYs = new Float32Array(headFrameCount);
            po.segmentFltns = new Float32Array(headFrameCount);
            po.interpSeparationMults = new Float32Array(headFrameCount)
          } else
            for (var i = 0; i < headFrameCount; i++) {
              po.segmentInterpXs[i] = 0;
              po.segmentInterpYs[i] = 0;
              po.segmentFltns[i] = 0;
              po.interpSeparationMults[i] = 0
            }
          lx = xx;
          ly = yy;
          if (!fp) {
            xx = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) / 5;
            m += 3;
            yy = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) / 5;
            m += 3;
            lx = xx;
            ly = yy;
            fp = true
          } else if (m == alen_m2 && protocolVersion >= 15) {
            var iang = a[m] << 8 | a[m + 1];
            po.segmentInitialAngle = iang;
            m += 2;
            var ang = iang * FIXED_POINT_TO_RAD;
            xx += Math.cos(ang) * defaultSegmentLength;
            yy += Math.sin(ang) * defaultSegmentLength
          } else {
            xx += (a[m] - 127) / 2;
            m++;
            yy += (a[m] - 127) / 2;
            m++
          }
          po.fpos = 0;
          po.ftg = 0;
          po.interpSeparationMult = 0;
          po.segmentX = xx;
          po.segmentY = yy;
          po.segmentInterpX = 0;
          po.segmentInterpY = 0;
          po.segmentFltn =
            0;
          po.segmentDa = 0;
          po.segmentLengthRatio = 1;
          po.segmentEbx = xx - lx;
          po.segmentEby = yy - ly;
          pts.push(po)
        }
        var j = 0;
        for (var i = pts.length - 1; i >= 0; i--) {
          if (j < smusCountMinus3) {
            k = separationMultipliers[j];
            j++
          }
          pts[i].smu = k
        }
        var o = createSnake(id, snx, sny, cv, ang, pts, msl, custom_skin);
        if (playerSnake == null) {
          viewX = xx;
          viewY = yy;
          playerSnake = o;
          try {
            var v = localStorage.cosmetic;
            if (v == "" + Number(v)) playerSnake.accessory = Number(v)
          } catch (e) {}
          playerSnake.md = false;
          playerSnake.wmd = false;
          o.nk = myNickname;
          lfsx = -1;
          lfsy = -1;
          lfcv = 0;
          lfvsx = -1;
          lfvsy = -1;
          lfesid = -1
        } else {
          o.nk = nk;
          if (!isValidNickname(nk)) o.nk = ""
        }
        o.ip = "";
        o.onk = "";
        if (useWebGL) {
          var nko =
            nameDeadpool.get();
          if (nko) {
            nko.visible = true;
            nko.text = nk;
            nko.style.fill = o.csw
          } else {
            nko = new PIXI.Text(o.nk, {
              fontFamily: "Arial",
              fontSize: 13,
              fill: o.csw,
              align: "center"
            });
            nko.anchor.set(.5, 0)
          }
          nko.alpha = 0;
          o.nko = nko;
          nmlo.addChild(nko)
        }
        o.targetAngle = o.serverAngle = wang;
        o.speed = speed;
        o.speedeedAngleFactor = o.speed / speedForFullTurn;
        if (o.speedeedAngleFactor > 1) o.speedeedAngleFactor = 1;
        o.fractionalLength = fam;
        o.scale = Math.min(6, 1 + (o.segmentCount - 2) / 106);
        o.scalealeAngleFactor = .13 + .87 * Math.pow((7 - o.scale) / 6, 2);
        o.ssp = baseSpeed + speedPerScale * o.scale;
        o.fsp = o.ssp + .1;
        o.widthSeparation = 6 * o.scale;
        var mwsep = minSegmentSpacing / gameScale;
        if (o.widthSeparation < mwsep) o.widthSeparation = mwsep;
        o.separation = o.widthSeparation;
        snakeLength(o)
      } else {
        var is_kill =
          a[m] == 1;
        m++;
        for (var i = allSnakes.length - 1; i >= 0; i--)
          if (allSnakes[i].id == id) {
            var o = allSnakes[i];
            o.id = -1234;
            if (is_kill) {
              o.isDead = true;
              o.isDead_amt = 0;
              o.edir = 0
            } else deleteSnakeAtIndex(i);
            delete os["s" + id];
            break
          }
      }
    } else if (cmd == "F")
      if (protocolVersion >= 14) {
        var sx = a[m];
        m++;
        var sy = a[m];
        m++;
        var axx = sx * sectorSize;
        var ayy = sy * sectorSize;
        var xx, yy;
        var rx, ry;
        var cv, rad, id, fo;
        while (m < alen) {
          cv = a[m];
          m++;
          rx = a[m];
          m++;
          ry = a[m];
          m++;
          xx = axx + rx * sectorSizeDiv256;
          yy = ayy + ry * sectorSizeDiv256;
          rad = a[m] / 5;
          m++;
          id = sx << 24 | sy << 16 | rx << 8 | ry;
          fo = createFood(id, xx,
            yy, rad, true, cv);
          fo.sx = sx;
          fo.sy = sy
        }
      } else if (protocolVersion >= 4) {
      var gsi = false;
      var sx, sy;
      while (m < alen) {
        var cv = a[m];
        m++;
        xx = a[m] << 8 | a[m + 1];
        m += 2;
        yy = a[m] << 8 | a[m + 1];
        m += 2;
        var rad = a[m] / 5;
        m++;
        var id = yy * arenaSize * 3 + xx;
        var fo = createFood(id, xx, yy, rad, true, cv);
        if (!gsi) {
          gsi = true;
          sx = Math.floor(xx / sectorSize);
          sy = Math.floor(yy / sectorSize)
        }
        fo.sx = sx;
        fo.sy = sy
      }
    } else {
      var sx = a[m] << 8 | a[m + 1];
      m += 2;
      var sy = a[m] << 8 | a[m + 1];
      m += 2;
      while (m < alen) {
        var id = a[m] << 16 | a[m + 1] << 8 | a[m + 2];
        m += 3;
        var cv = a[m];
        m++;
        xx = sectorSize * (sx + a[m] / 255);
        m++;
        yy = sectorSize *
          (sy + a[m] / 255);
        m++;
        var rad = a[m] / 5;
        m++;
        var fo = createFood(id, xx, yy, rad, true, cv);
        fo.sx = sx;
        fo.sy = sy
      }
    } else if (cmd == "b" || cmd == "f") {
      var id;
      if (protocolVersion >= 14) {
        var sx, sy;
        if (dlen >= 5) {
          sx = a[m];
          m++;
          sy = a[m];
          m++;
          lfsx = sx;
          lfsy = sy
        } else {
          sx = lfsx;
          sy = lfsy
        }
        var rx = a[m];
        m++;
        var ry = a[m];
        m++;
        var xx = sx * sectorSize + rx * sectorSizeDiv256;
        var yy = sy * sectorSize + ry * sectorSizeDiv256;
        id = sx << 24 | sy << 16 | rx << 8 | ry;
        var cv;
        if (dlen == 4 || dlen == 6) {
          cv = a[m];
          m++;
          lfcv = cv
        } else cv = lfcv;
        var rad = a[m] / 5;
        m++;
        var fo = createFood(id, xx, yy, rad, cmd == "b", cv);
        fo.sx = sx;
        fo.sy = sy
      } else if (protocolVersion >=
        4) {
        var cv = a[m];
        m++;
        if (dlen > 4) {
          xx = a[m] << 8 | a[m + 1];
          m += 2;
          yy = a[m] << 8 | a[m + 1];
          m += 2;
          id = yy * arenaSize * 3 + xx;
          var rad = a[m] / 5;
          m++;
          var fo = createFood(id, xx, yy, rad, cmd == "b", cv);
          fo.sx = Math.floor(xx / sectorSize);
          fo.sy = Math.floor(yy / sectorSize)
        }
      } else {
        id = a[m] << 16 | a[m + 1] << 8 | a[m + 2];
        m += 3;
        if (dlen > 4) {
          var cv = a[m];
          m++;
          var sx = a[m] << 8 | a[m + 1];
          m += 2;
          var sy = a[m] << 8 | a[m + 1];
          m += 2;
          xx = sectorSize * (sx + a[m] / 255);
          m++;
          yy = sectorSize * (sy + a[m] / 255);
          m++;
          var rad = a[m] / 5;
          m++;
          var fo = createFood(id, xx, yy, rad, cmd == "b", cv);
          fo.sx = sx;
          fo.sy = sy
        }
      }
    } else if (cmd == "c" ||
      cmd == "C" || cmd == "<") {
      var id;
      var ebid = -1;
      var sx, sy, rx, ry;
      if (protocolVersion >= 14) {
        if (cmd == "c" && dlen == 2 || cmd == "<" && dlen == 4 || cmd == "C" && dlen == 2) {
          sx = lfvsx;
          sy = lfvsy
        } else {
          sx = a[m];
          m++;
          sy = a[m];
          m++;
          lfvsx = sx;
          lfvsy = sy
        }
        rx = a[m];
        m++;
        ry = a[m];
        m++;
        id = sx << 24 | sy << 16 | rx << 8 | ry;
        if (cmd == "<") {
          ebid = a[m] << 8 | a[m + 1];
          m += 2;
          lfesid = ebid
        } else if (cmd == "C") ebid = lfesid
      } else if (protocolVersion >= 4) {
        var xx = a[m] << 8 | a[m + 1];
        m += 2;
        var yy = a[m] << 8 | a[m + 1];
        m += 2;
        id = yy * arenaSize * 3 + xx;
        ebid = a[m] << 8 | a[m + 1];
        m += 2
      } else {
        id = a[m] << 16 | a[m + 1] << 8 | a[m + 2];
        m += 3;
        ebid =
          a[m] << 8 | a[m + 1];
        m += 2
      }
      cm1 = foodsCount - 1;
      for (var i = cm1; i >= 0; i--) {
        var fo = allFoods[i];
        if (fo.id == id) {
          fo.foodEaten = true;
          if (ebid >= 0) {
            fo.foodEatenBy = os["s" + ebid];
            fo.foodEatenFrame = 0
          } else {
            if (useWebGL) deleteFood(fo);
            if (i == cm1) {
              allFoods[i] = null;
              foodsCount--;
              cm1--
            } else {
              allFoods[i] = allFoods[cm1];
              allFoods[cm1] = null;
              foodsCount--;
              cm1--
            }
          }
          id = -1;
          break
        }
      }
    } else if (cmd == "j") {
      var id = a[m] << 8 | a[m + 1];
      m += 2;
      xx = 1 + (a[m] << 8 | a[m + 1]) * 3;
      m += 2;
      yy = 1 + (a[m] << 8 | a[m + 1]) * 3;
      m += 2;
      var prey = null;
      for (i = allPreys.length - 1; i >= 0; i--)
        if (allPreys[i].id == id) {
          prey = allPreys[i];
          break
        } if (prey) {
        var csp = prey.sp * (elapsedTime /
          8) / 4;
        csp *= lagMultiplier;
        var ox = prey.xx;
        var oy = prey.yy;
        if (dlen == 15) {
          prey.dir = a[m] - 48;
          m++;
          prey.ang = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) * 2 * Math.PI / 16777215;
          m += 3;
          prey.wang = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) * 2 * Math.PI / 16777215;
          m += 3;
          prey.sp = (a[m] << 8 | a[m + 1]) / 1E3;
          m += 2
        } else if (dlen == 11) {
          prey.ang = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) * 2 * Math.PI / 16777215;
          m += 3;
          prey.sp = (a[m] << 8 | a[m + 1]) / 1E3;
          m += 2
        } else if (dlen == 12) {
          prey.dir = a[m] - 48;
          m++;
          prey.wang = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) * 2 * Math.PI / 16777215;
          m += 3;
          prey.sp = (a[m] << 8 | a[m + 1]) / 1E3;
          m += 2
        } else if (dlen == 13) {
          prey.dir = a[m] - 48;
          m++;
          prey.ang = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) * 2 * Math.PI / 16777215;
          m += 3;
          prey.wang = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) * 2 * Math.PI / 16777215;
          m += 3
        } else if (dlen == 9) {
          prey.ang = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) * 2 * Math.PI / 16777215;
          m += 3
        } else if (dlen == 10) {
          prey.dir = a[m] - 48;
          m++;
          prey.wang = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) * 2 * Math.PI / 16777215;
          m += 3
        } else if (dlen == 8) {
          prey.sp = (a[m] << 8 | a[m + 1]) / 1E3;
          m += 2
        }
        prey.xx = xx + Math.cos(prey.ang) * csp;
        prey.yy = yy + Math.sin(prey.ang) * csp;
        var dx = prey.xx - ox;
        var dy = prey.yy - oy;
        var k = prey.fpos;
        for (var j = 0; j < rightFrameCount; j++) {
          prey.fxs[k] -= dx * rightInterpFactors[j];
          prey.fys[k] -=
            dy * rightInterpFactors[j];
          k++;
          if (k >= rightFrameCount) k = 0
        }
        prey.fx = prey.fxs[prey.fpos];
        prey.fy = prey.fys[prey.fpos];
        prey.ftg = rightFrameCount
      }
    } else if (cmd == "y") {
      var id = a[m] << 8 | a[m + 1];
      m += 2;
      if (dlen == 2)
        for (var i = allPreys.length - 1; i >= 0; i--) {
          var prey = allPreys[i];
          if (prey.id == id) {
            if (useWebGL) deletePrey(prey);
            allPreys.splice(i, 1);
            break
          }
        } else if (dlen == 4) {
          var slither_id = a[m] << 8 | a[m + 1];
          m += 2;
          for (var i = allPreys.length - 1; i >= 0; i--) {
            var prey = allPreys[i];
            if (prey.id == id) {
              prey.eaten = true;
              prey.eaten_by = os["s" + slither_id];
              if (prey.eaten_by) prey.eaten_frameCounter = 0;
              else {
                if (useWebGL) deletePrey(prey);
                allPreys.splice(i, 1)
              }
              break
            }
          }
        } else {
          var cv =
            a[m];
          m++;
          xx = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) / 5;
          m += 3;
          yy = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) / 5;
          m += 3;
          var rad = a[m] / 5;
          m++;
          var dir = a[m] - 48;
          m++;
          var wang = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) * 2 * Math.PI / 16777215;
          m += 3;
          var ang = (a[m] << 16 | a[m + 1] << 8 | a[m + 2]) * 2 * Math.PI / 16777215;
          m += 3;
          var speed = (a[m] << 8 | a[m + 1]) / 1E3;
          m += 2;
          createPrey(id, xx, yy, rad, cv, dir, wang, ang, speed)
        }
    } else if (cmd == "k") {
      var id = a[m] << 8 | a[m + 1];
      m += 2;
      var o = os["s" + id];
      if (o) o.kill_count = a[m] << 16 | a[m + 1] << 8 | a[m + 2]
    } else if (cmd == "z") {
      realFluxGradient = a[m] << 16 | a[m + 1] << 8 | a[m + 2];
      m += 3;
      var k =
        fluxGradientPos;
      for (j = 0; j < fluxCount; j++) {
        fluxGradients[k] = fluxGradients[k] + (realFluxGradient - fluxGradients[k]) * fluxFactors[j];
        k++;
        if (k >= fluxCount) k = 0
      }
      fluxTarget = fluxCount
    } else if (testing) {
      console.log("error!");
      var dd = [];
      for (var i = 0; i < a.length; i++) dd.push(("00" + (a[i] + 0).toString(16)).substr(-2));
      console.log(dd.join(" "))
    }
  };
  webSocket.onerror = function(a) {};
  webSocket.onclose = function(a) {
    if (webSocket == this) {
      isConnected = false;
      isPlaying = false
    }
  };
  var fiss = [];
  webSocket.onopen = function(a) {
    if (webSocket != this) return;
    var s = asciiOnly(nicknameInput.value);
    if (s.length > 24) s = s.substr(0, 24);
    if (s.toLowerCase() ==
      "gameweek2016") {
      s = "";
      try {
        localStorage.gw2k16 = "1";
        gw2k16 = true
      } catch (e) {}
    }
    myNickname = s;
    if (!isValidNickname(s)) s = "";
    var cv = Math.floor(Math.random() * 9);
    try {
      var mcv = localStorage.snakercv;
      if (mcv == "" + Number(mcv)) cv = Number(mcv)
    } catch (e) {}
    var client_version = 291;
    var cpw = [54, 206, 204, 169, 97, 178, 74, 136, 124, 117, 14, 210, 106, 236, 8, 208, 136, 213, 140, 111];
    var ca = [];
    var wca = false;
    var taa = "";
    try {
      wca = localStorage.want_custom_skin == "1";
      taa = localStorage.custom_skin
    } catch (e) {}
    if (wca)
      if (taa)
        if (taa.length > 0) {
          taa = ("" + taa).split(",");
          ca = new Uint8Array(taa.length);
          for (var i = 0; i < taa.length; i++) ca[i] = Number(taa[i])
        } var ba;
    if (checkingCode) {
      if (etcods.length == 14) {
        ba = new Uint8Array(7);
        ba[0] = 111;
        var v1 = etcods[0].v * 1E3 + etcods[1].v * 100 + etcods[2].v * 10 + etcods[3].v;
        var v2 = etcods[5].v * 1E3 + etcods[6].v * 100 + etcods[7].v * 10 + etcods[8].v;
        var v3 = etcods[10].v * 1E3 + etcods[11].v * 100 + etcods[12].v * 10 + etcods[13].v;
        ba[1] = v1 >> 8 & 255;
        ba[2] = v1 & 255;
        ba[3] = v2 >> 8 & 255;
        ba[4] = v2 & 255;
        ba[5] = v3 >> 8 & 255;
        ba[6] = v3 & 255
      }
    } else {
      ba = new Uint8Array(8 + 20 + s.length + ca.length);
      ba[0] = 115;
      ba[1] = 30;
      ba[2] = client_version >>
        8 & 255;
      ba[3] = client_version & 255;
      for (var i = 0; i < 20; i++) ba[4 + i] = cpw[i];
      ba[24] = cv;
      ba[25] = s.length;
      var m = 26;
      for (var i = 0; i < s.length; i++) {
        ba[m] = s.charCodeAt(i);
        m++
      }
      ba[m] = 0;
      m++;
      ba[m] = 255;
      m++;
      for (var i = 0; i < ca.length; i++) {
        ba[m] = ca[i];
        m++
      }
    }
    sendLogin(ba);
    highQuality = true;
    graphicsLevelAlpha = 1;
    wantDecreaseGraphicsFrames = 0;
    qualityScaleMult = 1;
    if (!useWebGL)
      if (want_quality == 0) {
        highQuality = false;
        graphicsLevelAlpha = 0;
        qualityScaleMult = 1.7
      } if (render_mode == 1) {
      highQuality = false;
      graphicsLevelAlpha = 0
    }
    lastPingSendTime = timeObject.now()
  }
}

function asciiOnly(s) {
  var i, l, v;
  l = s.length;
  var need_fix = false;
  for (i = 0; i < l; i++) {
    v = s.charCodeAt(i);
    if (v < 32 || v > 127) {
      need_fix = true;
      break
    }
  }
  if (need_fix) {
    var fs = "";
    for (i = 0; i < l; i++) {
      v = s.charCodeAt(i);
      if (v < 32 || v > 127) fs += " ";
      else fs += String.fromCharCode(v)
    }
    return fs
  }
  return s
}
var skinMenuHolder = document.getElementById("smh");
var csk = document.getElementById("csk");
var cosmeticSkinHolder = document.getElementById("cskh");
var bsk = document.getElementById("bsk");
var buildSkinHolder = document.getElementById("bskh");
var scos = document.getElementById("scos");
var selectCosmeticHolder = document.getElementById("scosh");
var etco = document.getElementById("etco");
var enterCodeHolder = document.getElementById("etcoh");
var csrv = document.getElementById("csrv");
var cosmeticServerHolder = document.getElementById("csrvh");
var trumpbtn;
var trumpbtnh;
var votetxth;
var votetxt_a;
var kamalabtn;
var kamalabtnh;
if (teamsExist) {
  trumpbtn = document.getElementById("trumpbtn");
  trumpbtnh = document.getElementById("trumpbtnh");
  votetxth = document.getElementById("votetxth");
  votetxt_a = .75;
  votetxth.style.opacity = votetxt_a;
  kamalabtn = document.getElementById("kamalabtn");
  kamalabtnh = document.getElementById("kamalabtnh")
}
var want_quality = 1;
var grqi = document.getElementById("grqi");
try {
  if (localStorage.qual == "0") {
    grqi.src = "http://slither.io/s/lowquality.png";
    want_quality = 0
  } else {
    phqi.src = "http://slither.io/s/lowquality.png";
    want_quality = 1
  }
} catch (e) {}
graphicsQuality.onclick = function() {
  try {
    if (localStorage.qual == "0") {
      localStorage.qual = "1";
      grqi.src = "http://slither.io/s/highquality.png";
      want_quality = 1
    } else {
      localStorage.qual = "0";
      grqi.src = "http://slither.io/s/lowquality.png";
      want_quality = 0
    }
  } catch (e) {}
  return false
};
var playQuality = document.getElementById("plq");
var closeQuality = document.getElementById("clq");
cosmeticSkinHolder.style.display = "inline";
cosmeticServerHolder.style.display = "inline";
if (!is_mobile)
  if (!teamsDisabled)
    if (teamsExist) {
      trumpbtnh.style.display = "inline";
      votetxth.style.display = "inline";
      kamalabtnh.style.display = "inline"
    } var psk = document.getElementById("psk");
var prevSkinHolder = document.getElementById("pskh");
var nsk = document.getElementById("nsk");
var nextSkinHolder = document.getElementById("nskh");
var etcod = document.getElementById("etcod");
var etcot = document.createElement("div");
etcod.appendChild(etcot);
var t = etcot;
t.style.position = "absolute";
t.style.width = "800px";
t.style.height = "32px";
t.style.textAlign = "center";
t.style.color = "#FFFFFF";
t.style.fontWeight = "bold";
t.style.textAlign = "center";
t.style.fontFamily = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
t.style.fontSize = "18px";
t.textContent = "if you have a code, enter it here!";
t.className = "nsi";
var etcobs = [];
for (var i = 0; i <= 10; i++) {
  var a = document.createElement("a");
  a.draggable = false;
  a.href = "#";
  a.className = "btn btnt";
  var ii = document.createElement("img");
  ii.width = 135;
  ii.height = 135;
  ii.className = "nsi";
  ii.style.position = "absolute";
  ii.draggable = false;
  ii.style.opacity = 0;
  etcod.appendChild(a);
  a.appendChild(ii);
  a.onclick = function() {
    var o;
    for (var i = etcobs.length - 1; i >= 0; i--)
      if (etcobs[i].a == this) {
        o = etcobs[i];
        if (o.v == 10) deleteLastCodeDigit();
        else enterCodeDigit(o.v);
        break
      } return false
  };
  ii.onload = function() {
    var o;
    for (var i =
        etcobs.length - 1; i >= 0; i--)
      if (etcobs[i].ii == this) {
        o = etcobs[i];
        o.loaded = true;
        break
      }
  };
  var o = {};
  o.ii = ii;
  o.a = a;
  o.alpha = 0;
  o.v = i;
  etcobs.push(o)
}
var pstr = "Cancel";
if (lang == "de") pstr = "Stornieren";
else if (lang == "fr") pstr = "Annuler";
else if (lang == "pt") pstr = "Cancelar";
else if (lang == "es") pstr = "Cancelar";
var o = makeTextButton(String.fromCharCode(160) + pstr + String.fromCharCode(160), 47, 20, 34, 1);
var cancel_code_btn = o;
var etcocdiv = o.elem;
etcocdiv.style.zIndex = 53;
etcocdiv.style.position = "fixed";
etcocdiv.onclick = function() {
  if (enteringCode)
    if (!checkingCode) {
      stchco();
      endingEnterCode = true
    }
};
etcod.appendChild(etcocdiv);
var etco_sp_ii = document.createElement("img");
etco_sp_ii.width = 100;
etco_sp_ii.height = 100;
etco_sp_ii.className = "nsi";
etco_sp_ii.style.position = "absolute";
etco_sp_ii.draggable = false;
etco_sp_ii.style.opacity = 0;
etcod.appendChild(etco_sp_ii);
var etcdis = [];
var etc_ww = 47 * 15;
var etc_hh = 67;
var etcc = document.createElement("canvas");
etcc.style.position = "absolute";
etcc.width = etc_ww;
etcc.height = etc_hh;
etcod.appendChild(etcc);
var etcbx = 0;
var etcdx = etc_ww / 2 - 54 / 2;
var etcods = [];
var ever_showed_entercode = false;
var enteringCode = false;
var checkingCode = false;
var endingEnterCode = false;
var wantOpenCosmetics = false;
var etca = 0;
var etcba = 0;
var etcbaa = 1;
var etcsv = 0;
var etcsrv = 0;
var etcsa = 0;
var etcshk = false;
var etcshkv = 0;
var hacos = false;
var bonkz = false;
var actco = [];

function stchco() {
  checkingCode = false;
  for (var i = etcobs.length - 1; i >= 0; i--) etcobs[i].a.className = "btn btnt";
  cancel_code_btn.setEnabled(true);
  resetGameState()
}

function recalculateActivatedCosmetics() {
  actco = [];
  var coco = 32;
  for (var i = 0; i < coco; i++) actco.push(0);
  var cocds = [];
  try {
    var cocdstr = localStorage.cocds;
    if (cocdstr) cocds = ("" + cocdstr).split(",")
  } catch (e) {}
  for (var i = 0; i < cocds.length; i++) {
    s = cocds[i];
    if (s.length == 14) {
      var v1 = Number(s.substr(0, 4));
      var v2 = Number(s.substr(5, 4));
      var v3 = Number(s.substr(10, 4));
      var wants = [];
      wants.push(v1 * 7 % coco);
      wants.push(v2 * 7 % coco);
      wants.push(v3 * 7 % coco);
      for (var j = wants.length - 1; j >= 0; j--) {
        var k = wants[j];
        for (var n = 0; n < 64; n++) {
          if (actco[k] ==
            0) {
            actco[k] = 1;
            if (!hacos) {
              hacos = true;
              enterCodeHolder.style.display = "inline";
              reposGraphicsQuality()
            }
            break
          }
          k++;
          if (k >= coco) k = 0
        }
      }
    }
  }
}

function enterCodeDigit(v) {
  if (enteringCode)
    if (!checkingCode)
      if (etcods.length < 14) {
        var o = {};
        o.v = v;
        etcods.push(o);
        if (etcods.length == 4 || etcods.length == 9) {
          var o = {};
          o.v = 10;
          etcods.push(o)
        }
        if (etcods.length == 14) {
          wantPlay = true;
          checkingCode = true;
          for (var i = etcobs.length - 1; i >= 0; i--) etcobs[i].a.className = "btn_disabled btnt";
          cancel_code_btn.setEnabled(false)
        }
      }
}

function deleteLastCodeDigit() {
  if (enteringCode)
    if (!checkingCode)
      if (etcods.length > 0) {
        if (etcods[etcods.length - 1].v == 10) etcods.splice(etcods.length - 1, 1);
        if (etcods.length > 0) etcods.splice(etcods.length - 1, 1)
      }
}
var choosingSkin = false;
var buildingSkin = false;
var endingBuildSkin = false;
var buildSkinAlpha = 0;
var bskoy = 0;
var skinOptionsYOffset = 0;
var buildSegments = [];
var buildSkinButtons = [];
var selectingCosmetic = false;
var endingSelectCosmetic = false;
var selectCosmeticAlpha = 0;
var secosoy = 0;
var selectCosmeticYOffset = 0;
var cosmeticButtons = [];
psk.onclick = function() {
  if (buildingSkin || selectingCosmetic) return false;
  if (isPlaying)
    if (playerSnake != null) {
      var cv = playerSnake.rcv;
      cv--;
      if (cv < 0) cv = max_skin_cv;
      if (!gw2k16)
        if (cv == 42) cv--;
      applySkin(playerSnake, cv, null);
      try {
        localStorage.want_custom_skin = "0"
      } catch (e) {}
    } return false
};
nsk.onclick = function() {
  if (buildingSkin || selectingCosmetic) return false;
  if (isPlaying)
    if (playerSnake != null) {
      var cv = playerSnake.rcv;
      cv++;
      if (!gw2k16)
        if (cv == 42) cv++;
      if (cv > max_skin_cv) cv = 0;
      applySkin(playerSnake, cv, null);
      try {
        localStorage.want_custom_skin = "0"
      } catch (e) {}
    } return false
};

function reposSkinStuff() {
  skinOptionsDiv.style.left = Math.round(ww / 2 - skinOptionsDiv.offsetWidth / 2) + "px";
  if (buildingSkin) skinOptionsDiv.style.top = Math.round(hh / 2 + 120 + 94 * skinOptionsYOffset) + "px";
  else if (selectingCosmetic) skinOptionsDiv.style.top = Math.round(hh / 2 + 120 + 94 * selectCosmeticYOffset) + "px";
  else skinOptionsDiv.style.top = Math.round(hh / 2 + 120) + "px";
  revertDiv.style.left = Math.round(ww / 2 - revertDiv.offsetWidth / 2 - skinOptionsDiv.offsetWidth - 62) + "px";
  revertDiv.style.top = Math.round(hh / 2 + 120 + 94 * skinOptionsYOffset) + "px"
}
csk.onclick = function() {
  if (!isPlaying)
    if (deadTime == -1) {
      resetGameState();
      bodySmoothingConst = 0;
      recalcSeparationMultipliers();
      choosingSkin = true;
      prevSkinHolder.style.opacity = 0;
      nextSkinHolder.style.opacity = 0;
      buildSkinHolder.style.opacity = 0;
      selectCosmeticHolder.style.opacity = 0;
      skinOptionsDiv.style.opacity = 0;
      revertDiv.style.opacity = 0;
      prevSkinHolder.style.display = "inline";
      nextSkinHolder.style.display = "inline";
      buildSkinHolder.style.display = "inline";
      if (hacos) selectCosmeticHolder.style.display = "inline";
      skinOptionsDiv.style.display = "inline";
      revertDiv.style.display = "none";
      reposSkinStuff();
      nicknameInput.disabled = true;
      if (maxSegmentCountPerSnake == 0) setMaxSegmentCountPerSnake(300);
      var pts = [];
      for (var i = 27; i >=
        1; i--) {
        var xx = arenaSize / 2 - i * 10;
        var yy = arenaSize / 2;
        var po = {
          xx: xx,
          yy: yy,
          fx: 0,
          fy: 0,
          fltn: 0,
          da: 0,
          ltn: 1
        };
        po.segmentInterpXs = new Float32Array(headFrameCount);
        po.segmentInterpYs = new Float32Array(headFrameCount);
        po.segmentFltns = new Float32Array(headFrameCount);
        po.interpSeparationMults = new Float32Array(headFrameCount);
        po.fpos = 0;
        po.ftg = 0;
        po.segmentSmu = 1;
        po.interpSeparationMult = 0;
        po.segmentDa = 0;
        po.segmentEbx = 10;
        po.segmentEby = 0;
        pts.push(po)
      }
      var cv = 0;
      try {
        var mcv = localStorage.snakercv;
        if (mcv == "" + Number(mcv)) cv = Number(mcv)
      } catch (e) {}
      var aa = null;
      var wca = false;
      var taa = "";
      try {
        wca = localStorage.want_custom_skin == "1";
        taa = localStorage.custom_skin
      } catch (e) {}
      if (wca)
        if (taa)
          if (taa.length >
            0) {
            taa = ("" + taa).split(",");
            aa = new Uint8Array(taa.length);
            for (var i = 0; i < taa.length; i++) aa[i] = Number(taa[i])
          } var o = createSnake(1, arenaSize / 2, arenaSize / 2, cv, 0, pts, defaultSegmentLength, aa);
      viewX = arenaSize / 2 - (22 / 2 - .5) * 10;
      viewY = arenaSize / 2;
      playerSnake = o;
      try {
        var v = localStorage.cosmetic;
        if (v == "" + Number(v)) playerSnake.accessory = Number(v)
      } catch (e) {}
      o.nk = "";
      o.ip = "";
      o.onk = "";
      o.targetAngle = o.serverAngle = o.currentAngle;
      o.speed = 4.8;
      o.speedeedAngleFactor = o.speed / speedForFullTurn;
      if (o.speedeedAngleFactor > 1) o.speedeedAngleFactor = 1;
      o.scale = 1;
      o.scalealeAngleFactor = 1;
      o.ssp = baseSpeed + speedPerScale * o.scale;
      o.fsp = o.ssp + .1;
      o.widthSeparation = 6 * o.scale;
      var mwsep = minSegmentSpacing / gameScale;
      if (o.widthSeparation < mwsep) o.widthSeparation =
        mwsep;
      o.separation = o.widthSeparation;
      o.separation = o.widthSeparation = 18.25;
      snakeLength(o);
      o.alive_amt = 1;
      o.rex = 1.66;
      webSocket = {};
      webSocket.send = function(a) {};
      webSocket.close = function() {};
      isConnected = true;
      isPlaying = true;
      highQuality = true;
      graphicsLevelAlpha = 1;
      wantDecreaseGraphicsFrames = 0;
      qualityScaleMult = 1;
      startShowGame();
      leaderboardHeader.style.display = "none";
      leaderboardScores.style.display = "none";
      leaderboardNames.style.display = "none";
      leaderboardPositions.style.display = "none";
      leaderboardFooter.style.display = "none";
      victoryMessage.style.display = "none";
      locationHolder.style.display = "none"
    } return false
};
csrv.onclick = function() {
  showServers();
  return false
};
if (teamsExist) {
  trumpbtn.onclick = function() {
    var aa = new Uint8Array(3);
    aa[0] = 99;
    aa[1] = 116;
    aa[2] = 1;
    forceServerOnce("40.160.21.51", 443, aa);
    playButton.elem.onclick()
  };
  kamalabtn.onclick = function() {
    var aa = new Uint8Array(3);
    aa[0] = 99;
    aa[1] = 116;
    aa[2] = 2;
    forceServerOnce("40.160.21.51", 443, aa);
    playButton.elem.onclick()
  }
}
etco.onclick = function() {
  if (!etco_sp_ii) {
    etco_sp_ii = document.createElement("img");
    etco_sp_ii.width = 100;
    etco_sp_ii.height = 100
  }
  if (!isPlaying)
    if (deadTime == -1) {
      resetGameState();
      enteringCode = true;
      endingEnterCode = false;
      if (!ever_showed_entercode) {
        ever_showed_entercode = true;
        for (var i = etcobs.length - 1; i >= 0; i--)
          if (i == 10) etcobs[i].ii.src = "http://slither.io/s/codedel.png";
          else etcobs[i].ii.src = "http://slither.io/s/code" + i + ".png";
        etco_sp_ii.src = "http://slither.io/s/spinner.png";
        for (var i = 0; i <= 11; i++) {
          var ii = document.createElement("img");
          ii.width = 54;
          ii.height = 67;
          var j = i;
          if (i == 10) j = "h";
          else if (i == 11) j = "b";
          ii.onload = function() {
            for (var i = etcdis.length - 1; i >= 0; i--) {
              var o = etcdis[i];
              if (o.ii == this) o.loaded = true
            }
          };
          var o = {};
          o.ii = ii;
          o.loaded = false;
          etcdis.push(o);
          ii.src = "http://slither.io/s/cd" + j + ".png"
        }
      }
      etcod.style.display = "inline";
      reposEnterCode();
      nicknameInput.disabled = true
    } return false
};
bsk.onclick = function() {
  if (isPlaying)
    if (choosingSkin)
      if (!buildingSkin && !selectingCosmetic) {
        var i, j, k;
        var o;
        var fj = 0;
        var tj = 0;
        buildSegments = [];
        alcsc = falcsc;
        var taa = "";
        try {
          localStorage.want_custom_skin = "1";
          taa = localStorage.custom_skin
        } catch (e) {}
        if (taa)
          if (taa.length > 0) {
            taa = ("" + taa).split(",");
            var ct = 0;
            var cc = -1;
            var on_ct = true;
            for (var i = 8; i < taa.length; i++) {
              if (on_ct) ct = Number(taa[i]);
              else {
                cc = Number(taa[i]);
                for (var j = 0; j < ct; j++) buildSegments.push(cc)
              }
              on_ct = !on_ct
            }
          } applySkin(playerSnake, 0, getBuildSkinData(true));
        buildingSkin = true;
        endingBuildSkin = false;
        var rc = 4;
        var sks2 = [];
        var rls = [];
        for (i = 0; i < rc; i++) {
          k = 0;
          tj = Math.floor(csks.length * (i + 1) / rc);
          for (j = fj; j < tj; j++) k++;
          rls.push(k);
          fj = tj
        }
        rls[0]--;
        rls[1]--;
        rls[2]++;
        rls[3]++;
        var tsks = [];
        fj = 0;
        for (i = 0; i < rc; i++) {
          tsks = [];
          sks2.push(tsks);
          for (j = 0; j < rls[i]; j++) {
            tsks.push(csks[fj]);
            fj++
          }
        }
        for (k = 0; k < sks2.length; k++) {
          tsks = sks2[k];
          for (i = 0; i < tsks.length; i++) {
            j = tsks[i];
            if (j >= 0 && j < rrs.length) {
              o = {};
              var pci = per_color_imgs[j];
              var kmainCanvas = pci.kmcs[0];
              var ii = document.createElement("canvas");
              o.ii = ii;
              ii.width = kmainCanvas.width;
              ii.height = kmainCanvas.height;
              var ctx = ii.getContext("2d");
              ctx.rotate(Math.PI);
              ctx.drawImage(kmainCanvas, -kmainCanvas.width, -kmainCanvas.height);
              ii.style.opacity = 0;
              ii.style.position = "absolute";
              ii.style.left = "0px";
              ii.style.top = "0px";
              ii.draggable = false;
              o.headX = Math.floor(tsks.length * 55 * (i - (tsks.length - 1) / 2) / tsks.length);
              o.headY = Math.floor(-32 - k * 62);
              var a = document.createElement("a");
              a.draggable = false;
              a.href = "#";
              a.className = "btn btnt";
              a.style.zIndex = 53;
              a.style.position = "fixed";
              a.appendChild(ii);
              o.a = a;
              document.body.appendChild(a);
              o.cv = j;
              a.onclick = function() {
                if (!choosingSkin) return false;
                if (!buildingSkin) return false;
                if (buildSegments.length >= 47) return false;
                for (var i = buildSkinButtons.length - 1; i >= 0; i--)
                  if (buildSkinButtons[i].a == this) {
                    buildSegments.push(buildSkinButtons[i].cv);
                    break
                  } applySkin(playerSnake, 0, getBuildSkinData(true));
                return false
              };
              buildSkinButtons.push(o)
            }
          }
        }
        reposBskbtns();
        revertDiv.style.opacity = 0;
        revertDiv.style.display = "inline"
      } return false
};
scos.onclick = function() {
  if (isPlaying)
    if (choosingSkin)
      if (!buildingSkin && !selectingCosmetic) {
        selectingCosmetic = true;
        endingSelectCosmetic = false;
        var o;
        var k = 0;
        var tw = 1;
        for (var i = 0; i < 32; i++)
          if (actco.length > i && actco[i] == 1) tw++;
        if (tw > 8) tw = 8;
        for (var i = 0; i <= 32; i++)
          if (i == 32 || actco.length > i && actco[i] == 1) {
            o = {};
            if (i == 32) o.v = -1;
            else o.v = i;
            var ii = document.createElement("img");
            ii.onload = function() {
              var o;
              for (var i = cosmeticButtons.length - 1; i >= 0; i--) {
                o = cosmeticButtons[i];
                if (o.ii == this) {
                  if (o.v == -1) {
                    o.ww = this.width * .5;
                    o.hh = this.height *
                      .5;
                    this.width = o.ww;
                    this.height = o.hh;
                    o.headX -= o.ww / 2;
                    o.headY -= o.hh / 2;
                    reposCosbtns()
                  } else {
                    o.ww = this.width * .35;
                    o.hh = this.height * .35;
                    this.width = o.ww;
                    this.height = o.hh;
                    o.headX -= o.ww / 2;
                    o.headY -= o.hh / 2;
                    reposCosbtns()
                  }
                  break
                }
              }
            };
            if (i == 32) ii.src = "http://slither.io/s/a_none.png";
            else ii.src = a_imgs[i].u;
            ii.style.opacity = 0;
            ii.style.position = "absolute";
            ii.style.left = "0px";
            ii.style.top = "0px";
            ii.draggable = false;
            o.ii = ii;
            setTransform(ii, "rotate(90deg)");
            o.headX = 102 * (k % 8 - (tw / 2 - .5));
            o.headY = -22 - 80 * Math.floor(k / 8);
            k++;
            var a = document.createElement("a");
            a.draggable = false;
            a.href = "#";
            a.className = "btn btnt";
            a.style.zIndex = 53;
            a.style.position = "fixed";
            a.appendChild(ii);
            o.a = a;
            document.body.appendChild(a);
            a.onclick = function() {
              if (!choosingSkin) return false;
              if (!selectingCosmetic) return false;
              for (var i = cosmeticButtons.length - 1; i >= 0; i--)
                if (cosmeticButtons[i].a == this) {
                  playerSnake.accessory = cosmeticButtons[i].v;
                  break
                } return false
            };
            cosmeticButtons.push(o)
          } reposCosbtns()
      } return false
};
nicknameInput.oninput = function() {
  var s = this.value;
  var fs = asciiOnly(s);
  if (fs.length > 24) fs = fs.substr(0, 24);
  if (s != fs) this.value = fs;
  if (s.toLowerCase() == "bonkers") {
    bonkz = true;
    enterCodeHolder.style.display = "inline";
    reposGraphicsQuality()
  }
};
victoryInput.oninput = function() {
  var s = this.value;
  var fs = asciiOnly(s);
  if (fs.length > 140) fs = fs.substr(0, 140);
  if (s != fs) this.value = fs
};
nicknameInput.focus();
var s = "";
for (var i = 0; i < zzs.length; i++) s += String.fromCharCode(zzs[i] + 32);
piar(s);
var lmch = document.createElement("div");
lmch.style.width = "450px";
lmch.style.height = "115px";
var lmc2 = document.createElement("canvas");
var lmainCanvas = document.createElement("canvas");
var lgameScale = 1;
var lw = 450 * 2;
var lh = 135 * 2;
lmainCanvas.width = lmc2.width = lw;
lmainCanvas.height = lmc2.height = lh;
var lctx = lmainCanvas.getContext("2d");
var lctx2 = lmc2.getContext("2d");
setTransform(lmc2, "scale(.5, .5)");
setTransformOrigin(lmc2, "0% 0%");
lmch.appendChild(lmc2);
logo.appendChild(lmch);
var lts = [];
lts.push({
  pts: [107, 107, 80, 83, 53, 98, 31, 115, 55, 131, 98, 147, 101, 162, 101, 190, 66, 188, 49, 187, 34, 173],
  kc: 22,
  webSocket: 4,
  wr: .025,
  qm: .025,
  sp: .06,
  sz: 11
}, {
  pts: [150, 30, 150, 30 + (184 - 30) / 2, 150, 184],
  kc: 66,
  webSocket: 4,
  wr: .05,
  qm: .025,
  sp: .06,
  sz: 11
}, {
  pts: [207, 96, 207, 96 + (184 - 96) / 2, 207, 184],
  kc: 46,
  webSocket: 4,
  wr: .03,
  qm: .035,
  sp: .06,
  sz: 11
}, {
  pts: [207, 47, 207, 47 + (50 - 47) / 2, 207, 50],
  kc: 11,
  webSocket: 2,
  wr: .06,
  qm: .05,
  sp: .06,
  sz: 15,
  r: .5
}, {
  pts: [267, 65, 267, 65 + (164 - 65) / 2, 267, 164, 267, 194, 297, 186],
  kc: 66,
  webSocket: 6,
  wr: -.025,
  qm: -.0125,
  sp: .06,
  sz: 11,
  r: 1.5
}, {
  pts: [243, 94, 268, 94,
    293, 94
  ],
  kc: 66,
  webSocket: 4,
  wr: .015,
  qm: .025,
  sp: .06,
  sz: 9,
  r: 1.2
}, {
  pts: [338, 30, 338, 30 + (184 - 30) * 1 / 4, 338, 30 + (184 - 30) * 2 / 4, 338, 30 + (184 - 30) * 3 / 4, 338, 184,
    338, 164, 338, 144, 338, 104, 378, 104, 418, 104, 418, 144, 418, 164, 418, 184
  ],
  kc: 46,
  webSocket: 4,
  wr: .005,
  qm: .02,
  sp: .06,
  sz: 11,
  r: 2.1
}, {
  pts: [535, 175, 500, 201, 472, 175, 442, 138, 472, 105, 502, 84, 532, 105, 546, 118, 544, 139, 504, 139, 464,
    139],
  kc: 35,
  webSocket: 6,
  wr: -.013,
  qm: -.025,
  sp: .06,
  sz: 11,
  r: 1.3
}, {
  pts: [591, 96, 591, 96 + (184 - 96) / 2, 591, 184, 591, 184 + (126 - 184) / 2, 591, 126, 613, 82, 652, 109],
  kc: 38,
  webSocket: 4,
  wr: .01,
  qm: -.035,
  sp: .06,
  sz: 11
}, {
  pts: [663, 177, 663, 177 + (180 - 177) / 2, 663, 180],
  kc: 11,
  webSocket: 2,
  wr: .06,
  qm: .05,
  sp: .06,
  sz: 15
}, {
  pts: [717, 96, 717, 96 + (184 - 96) / 2, 717, 184],
  kc: 33,
  webSocket: 4,
  wr: .06,
  qm: .05,
  sp: .06,
  sz: 11
}, {
  pts: [717, 47, 717, 47 + (50 - 47) / 2, 717, 50],
  kc: 11,
  webSocket: 2,
  wr: .06,
  qm: .05,
  sp: .06,
  sz: 15
}, {
  pts: [814, 186, 860, 188, 858, 136, 854, 96, 814, 96, 770, 96, 770, 136, 770, 186, 814, 186],
  kc: 43,
  webSocket: 4,
  wr: 0,
  qm: .0274,
  sp: .073,
  sz: 11,
  r: 1.5
});
for (var i = 0; i < lts.length; i++) lts[i].mwig = 5;
var lga = 0;
var lgss = 0;
var ncka = 0;
var mwig = 4;
var lgframeCounter = 0;
var lgtm = timeObject.now();

function showLogo(done) {
  var ct = timeObject.now();
  var et = (ct - lgtm) / 25;
  lgtm = ct;
  var ax1, ay1, cx1, cy1, ax2, ay2, ix1, iy1, ix2, iy2, pax1, pay1, lpax1, lpay1, alpax1, alpay1, d, i, j, ang, gang,
    wang, dmv, q, rr, gg, bb, r;
  lgframeCounter += et;
  if (lts[lts.length - 1].mwig == 0 && lga == 1 && lgss == 1 && ncka == 1) {
    clearInterval(showlogo_iv);
    showlogo_iv = -1
  } else {
    if (done || lga != 1) {
      lga += .05 * et;
      if (lga >= 1) lga = 1;
      lmc2.style.opacity = lga
    }
    if (lgss != 1) {
      lgss += .00375 * et;
      if (lgss >= 1) lgss = 1
    }
    if (done || ncka != 1) {
      ncka += .006 * et;
      if (ncka >= 1) ncka = 1;
      nicknameHolder.style.opacity = Math.min(1,
        ncka * 6);
      if (!is_mobile) skinMenuHolder.style.opacity = Math.max(0, Math.min(1, (ncka - .05) * 5));
      if (ncka >= .01) playHolder.style.opacity = Math.min(1, (ncka - .01) * 5)
    }
    lctx.clearRect(0, 0, lw, lh);
    for (i = 0; i < lts.length; i++) {
      var o = lts[i];
      var pts = o.bodyPoints;
      var kc = o.kc;
      var webSocket = o.webSocket;
      var wr = o.wr;
      var qm = o.qm;
      var sp = o.speed;
      var sz = o.sz;
      var r = o.r;
      var mwig = o.mwig;
      if (done) {
        o.wch = true;
        mwig = 1E-7
      }
      if (o.wch)
        if (mwig != 0) {
          mwig *= .982;
          mwig -= .001 * et;
          if (render_mode == 1) mwig -= .005 * et;
          if (mwig <= 0) mwig = 0;
          o.mwig = mwig
        } if (!r) r = 1;
      lctx.beginPath();
      if (i < 9) {
        var gd = ctx.createLinearGradient(0,
          70 * lgameScale, 0, 230 * lgameScale);
        gd.addColorStop(0, "#80FFA0");
        gd.addColorStop(1, "#008040");
        lctx.fillStyle = gd
      } else {
        var gd = ctx.createLinearGradient(0, 50 * lgameScale, 0, 265 * lgameScale);
        gd.addColorStop(0, "#9850FF");
        gd.addColorStop(1, "#281060");
        lctx.fillStyle = gd
      }
      dmv = false;
      gang = false;
      q = 0;
      ax2 = pts[0];
      ay2 = pts[1];
      alpax1 = lpax1 = ax2;
      alpay1 = lpay1 = ay2;
      var wig = webSocket;
      var wgang = lgframeCounter * sp;
      for (j = 2; j < pts.length; j += 4) {
        ax1 = ax2;
        ay1 = ay2;
        cx2 = pts[j];
        cy2 = pts[j + 1];
        ax2 = pts[j + 2];
        ay2 = pts[j + 3];
        for (var k = 1; k <= kc; k++) {
          q++;
          var s_amt = k / kc;
          ix1 = ax1 + (cx2 - ax1) * s_amt;
          iy1 =
            ay1 + (cy2 - ay1) * s_amt;
          ix2 = cx2 + (ax2 - cx2) * s_amt;
          iy2 = cy2 + (ay2 - cy2) * s_amt;
          pax1 = ix1 + (ix2 - ix1) * s_amt;
          pay1 = iy1 + (iy2 - iy1) * s_amt;
          wang = Math.atan2(pay1 - lpay1, pax1 - lpax1);
          if (!gang) {
            gang = true;
            ang = wang
          } else {
            if (wang - ang > Math.PI) wang -= 2 * Math.PI;
            else if (wang - ang < -Math.PI) wang += 2 * Math.PI;
            ang += (wang - ang) * .05;
            ang %= 2 * Math.PI
          }
          lpax1 = pax1;
          lpay1 = pay1;
          pax1 += Math.cos(Math.PI / 2 + ang) * Math.sin(wgang) * wig * mwig;
          pay1 += Math.sin(Math.PI / 2 + ang) * Math.sin(wgang) * wig * mwig;
          wgang -= .76 * qm * wig;
          wig += wr;
          lctx.beginPath();
          var fsz = sz * 1.15 * Math.min(1,
            lgameScale * (.2 + .8 * lga) * (30 * lgss * r - q / 20 - i / 2));
          if (fsz > .5) {
            lctx.arc(pax1 * lgameScale, pay1 * lgameScale, fsz, 0, TWO_PI);
            o.wch = true
          }
          lctx.fill()
        }
      }
    }
    lctx2.clearRect(0, 0, lw, lh);
    lctx2.shadowColor = "#000000";
    lctx2.shadowBlur = 16;
    lctx2.shadowOffsetY = 7;
    lctx2.drawImage(lmainCanvas, 0, 0)
  }
}
var showlogo_iv = -1;
if (is_safari || is_mobile) {
  lga = 1;
  lgss = 1;
  ncka = 1;
  showLogo(true)
} else showlogo_iv = setInterval(function() {
  showLogo(false)
}, 25);
document.onkeydown = function(e) {
  e = e || window.event;
  var v = e.keyCode;
  if (v == 37) keyDownLeft = true;
  else if (v == 39) keyDownRight = true;
  else if (v == 38 || v == 32) {
    keyDownUp = true;
    setAcceleration(1)
  } else if (v >= 48 && v <= 57)
    if (enteringCode) enterCodeDigit(v - 48);
    else {
      if (choosing_server)
        if (document.activeElement)
          if (document.activeElement != svit) {
            svit.value = "";
            svit.focus()
          }
    }
  else if (v == 8)
    if (enteringCode) deleteLastCodeDigit();
    else {
      if (choosing_server)
        if (document.activeElement)
          if (document.activeElement != svit) {
            svit.value = "";
            svit.focus()
          }
    }
  else if (v ==
    13 || v == 10)
    if (wantVictoryMessage) {
      if (victoryInput.value.length > 0) saveButton.elem.onclick()
    } else {
      if (!isConnecting && !isConnected) playButton.elem.onclick()
    }
  else if (v == 16) {
    if (testing) shifty = true
  } else if (v == 27)
    if (choosing_server) {
      svit.value = "";
      svit.focus()
    } if (testing) console.log("keydown: " + e.keyCode)
};
document.onkeyup = function(e) {
  e = e || window.event;
  var v = e.keyCode;
  if (v == 37) keyDownLeft = false;
  else if (v == 39) keyDownRight = false;
  else if (v == 38 || v == 32) {
    keyDownUp = false;
    setAcceleration(0)
  } else if (v == 16)
    if (testing) shifty = false
};

function loadSos(s) {
  if (forcing) return;
  if (s.length > 0) {
    serverList = [];
    clusters = [];
    var ala = s.charAt(0) == "a";
    var j = 1;
    var o = {};
    var k = 0;
    var m = 0;
    var n = 0;
    var v;
    var cv = 0;
    var cav = 0;
    var ia = [];
    var i6a = [];
    var pa = [];
    var aa = [];
    var clu = [];
    var sida = [];
    var active;
    while (j < s.length) {
      v = (s.charCodeAt(j++) - 97 - cav) % 26;
      if (v < 0) v += 26;
      cv *= 16;
      cv += v;
      cav += 7;
      if (n == 1) {
        if (m == 0) {
          active = cv <= 26;
          m++
        } else if (m == 1) {
          ia.push(cv);
          if (ia.length == 4) m++
        } else if (m == 2) {
          i6a.push(cv);
          if (i6a.length == 16) m++
        } else if (m == 3) {
          pa.push(cv);
          if (pa.length == 2) m++
        } else if (m ==
          4) {
          aa.push(cv);
          if (aa.length == 2) m++
        } else if (m == 5) {
          clu.push(cv);
          if (clu.length == 1) m++
        } else if (m == 6) {
          sida.push(cv);
          if (sida.length == 2) {
            var po = 0;
            for (var k = 0; k < pa.length; k++) {
              po *= 256;
              po += pa[k]
            }
            var ac = 0;
            for (var k = 0; k < aa.length; k++) {
              ac *= 256;
              ac += aa[k]
            }
            var sid = 0;
            for (var k = 0; k < sida.length; k++) {
              sid *= 256;
              sid += sida[k]
            }
            for (var z = 1; z <= 2; z++) {
              o = {};
              if (z == 1) o.ip = ia.join(".");
              else if (i6a.length == 16) {
                var fip6 = [];
                var q;
                var gg = false;
                for (var k = 0; k < i6a.length; k += 2) {
                  q = i6a[k] * 256 + i6a[k + 1];
                  if (q != 0) gg = true;
                  fip6.push(q.toString(16))
                }
                if (!gg) break;
                o.ip = "[" + fip6.join(":") + "]"
              } else break;
              o.po = po;
              o.ac = ac;
              o.sid = sid;
              o.active = active;
              o.wg = ac + 5;
              if (z == 1) o.clu = clu[0];
              else o.clu = clu[0] + 1E3;
              var cluo;
              if (!clusters[o.clu]) {
                cluo = {};
                clusters[o.clu] = cluo;
                cluo.sis = [];
                cluo.ptms = [];
                cluo.swg = 0;
                cluo.tac = 0;
                cluo.serverList = []
              } else cluo = clusters[o.clu];
              o.cluo = cluo;
              if (o.active) cluo.swg += o.wg;
              cluo.serverList.push(o);
              cluo.tac += ac;
              serverList.push(o)
            }
            ia = [];
            i6a = [];
            pa = [];
            aa = [];
            clu = [];
            sida = [];
            m = 0
          }
        }
        cv = 0;
        n = 0
      } else n++
    }
    for (j = serverList.length - 1; j >= 0; j--) {
      n = 1;
      var cluo = serverList[j].cluo;
      if (cluo) {
        for (k = cluo.sis.length - 1; k >= 0; k--)
          if (cluo.sis[k].ip ==
            serverList[j].ip) {
            n = 0;
            break
          } if (n == 1) cluo.sis.push({
          ip: serverList[j].ip
        })
      }
    }
    serversLoadedAtTime = timeObject.now();
    for (j = clusters.length - 1; j >= 0; j--) {
      var cluo = clusters[j];
      if (cluo)
        if (cluo.sis.length > 0) {
          var k = Math.floor(Math.random() * cluo.sis.length);
          var ip = cluo.sis[k].ip;
          var ps = null;
          try {
            var ps = new WebSocket("ws://" + ip + ":80/ptc");
            if (testing) console.log("ptc")
          } catch (e) {
            ps = null
          }
          if (ps) {
            ps.binaryType = "arraybuffer";
            ps.onerror = function(e) {};
            ps.onmessage = function(e) {
              var a = new Uint8Array(e.data);
              if (a.length == 1 && a[0] == 112)
                for (var j = clusters.length -
                    1; j >= 0; j--) {
                  var cluo = clusters[j];
                  if (cluo)
                    if (cluo.ps == this) {
                      var ptm = Math.round(timeObject.now() - cluo.stm);
                      if (testing) console.log(" ping time for cluster " + j + ": " + ptm);
                      if (waitingForServers)
                        if (serversReadyAfterTime == -1) serversReadyAfterTime = timeObject.now() + 2667;
                      if (testing)
                        if (cluo.ptms.length == 0) console.log("first ping response for " + j + " at " + timeObject
                          .now());
                      cluo.ptms.push(ptm);
                      if (cluo.ptms.length < 3) {
                        cluo.stm = timeObject.now();
                        var ba = new Uint8Array(1);
                        ba[0] = 112;
                        this.send(ba)
                      } else {
                        this.close();
                        cluo.ps = null
                      }
                      break
                    }
                }
            };
            ps.onopen =
              function(a) {
                var found = false;
                for (var j = clusters.length - 1; j >= 0; j--) {
                  var cluo = clusters[j];
                  if (cluo)
                    if (cluo.ps == this) {
                      cluo.stm = timeObject.now();
                      var ba = new Uint8Array(1);
                      ba[0] = 112;
                      this.send(ba);
                      found = true;
                      break
                    }
                }
                if (!found) this.close()
              };
            cluo.ps = ps
          }
        }
    }
  }
}

function adjustCodeSpinner() {
  var sc = hh / 1500;
  if (sc > 1) sc = 1;
  setTransform(etco_sp_ii, "scale(" + sc + "," + sc + ") rotate(" + Math.round(36E3 * etcsrv / 12) / 100 + "deg)")
}

function reposGraphicsQuality() {
  if (hacos || bonkz) graphicsQualityHolder.style.top = "160px";
  else graphicsQualityHolder.style.top = "16px"
}

function reposEnterCode() {
  var sc = hh / 1500;
  if (sc > 1) sc = 1;
  etcod.style.width = Math.ceil(ww) + "px";
  etcod.style.height = Math.ceil(hh) + "px";
  var txt_y = Math.round(Math.max(42, (hh - 222) * .2));
  var code_y = Math.round(Math.max(60, .5 * txt_y + .5 * (hh / 2 + 100 * sc - 135 / 2 + -1 * sc * (135 + 20)) - 33));
  var spin_y = Math.round(code_y * .45 + .55 * (hh / 2 + 100 * sc - 135 / 2 + -1 * sc * (135 + 20)) - 33);
  etcot.style.left = Math.round(ww / 2 - 800 / 2) + "px";
  etcot.style.top = txt_y + "px";
  etcc.style.left = Math.round(ww / 2 - etc_ww / 2) + "px";
  etcc.style.top = code_y + "px";
  etco_sp_ii.style.left =
    Math.round(ww / 2 - 100 / 2) + "px";
  etco_sp_ii.style.top = spin_y + "px";
  adjustCodeSpinner();
  for (var i = etcobs.length - 1; i >= 0; i--) {
    var o = etcobs[i];
    var xx = 0;
    var yy = 0;
    var tsc = sc;
    if (i == 0) {
      xx = 0;
      yy = 2
    } else if (i == 1) {
      xx = -1;
      yy = -1
    } else if (i == 2) {
      xx = 0;
      yy = -1
    } else if (i == 3) {
      xx = 1;
      yy = -1
    } else if (i == 4) {
      xx = -1;
      yy = 0
    } else if (i == 5) {
      xx = 0;
      yy = 0
    } else if (i == 6) {
      xx = 1;
      yy = 0
    } else if (i == 7) {
      xx = -1;
      yy = 1
    } else if (i == 8) {
      xx = 0;
      yy = 1
    } else if (i == 9) {
      xx = 1;
      yy = 1
    } else if (i == 10) {
      xx = 1;
      yy = 2;
      tsc *= .75
    }
    o.ii.style.left = Math.round(ww / 2 - 135 / 2 + xx * sc * (135 + 20)) + "px";
    o.ii.style.top =
      Math.round(hh / 2 + 100 * sc - 135 / 2 + yy * sc * (135 + 20)) + "px";
    setTransform(o.ii, "scale(" + tsc + "," + tsc + ")")
  }
  var sc = hh / 750;
  if (sc > 1) sc = 1;
  setTransform(etcc, "scale(" + sc + "," + sc + ")");
  etcocdiv.style.left = Math.round(ww / 2 - etcocdiv.offsetWidth / 2) + "px";
  etcocdiv.style.bottom = Math.round(sc * 64) + "px"
}
var svl_a = 0;
var choosing_server = false;

function chooseServer(o) {
  if (o) {
    if (choosing_server) {
      if (svlo != null) {
        svlo.dv.style.border = "";
        svlo.dv.style.left = svlo.div_x + "px";
        svlo.dv.style.top = svlo.div_y + "px"
      }
      svlo = o;
      if (o.dv) {
        o.dv.style.border = "4px solid white";
        o.dv.style.left = o.div_x - 4 + "px";
        o.dv.style.top = o.div_y - 4 + "px"
      }
      svit.value = o.sid
    }
    bestServer = o;
    forcing = true
  }
}

function showServers() {
  choosing_server = true;
  var csid = -1;
  if (bestServer) csid = bestServer.sid;
  for (var i = svl_divs.length - 1; i >= 0; i--) svli.removeChild(svl_divs[i]);
  svl_divs = [];
  svlo = null;
  recalcPingTimes();
  if (csid == -1)
    if (forcedBestServer != null) csid = forcedBestServer.sid;
  serverList.sort(function(a, b) {
    return parseFloat(a.ptm) - parseFloat(b.ptm)
  });
  for (var i = serverList.length - 1; i >= 0; i--) {
    var sid = serverList[i].sid;
    for (var j = serverList.length - 1; j > i; j--) {
      var sid2 = serverList[j].sid;
      if (sid == sid2) {
        if (serverList[j].ptm > serverList[i].ptm) serverList.splice(j, 1);
        else serverList.splice(i, 1);
        j = -1;
        break
      }
    }
  }
  var tserverList = [];
  for (var i =
      0; i < serverList.length; i++)
    if (serverList[i].active || serverList[i] == bestServer || serverList[i] == forcedBestServer) tserverList.push(
      serverList[i]);
  svli.className = "nsi";
  var dx = -1;
  var dy = 0;
  var pad = svlpad;
  var ping_rs = [160, 0, 255, 255, 255];
  var ping_gs = [255, 255, 255, 136, 64];
  var ping_bs = [160, 0, 0, 0, 64];
  for (var i = 0; i < tserverList.length; i++) {
    dx++;
    if (dx >= 5) {
      dx = 0;
      dy++
    }
    var o = tserverList[i];
    var dv = document.createElement("div");
    dv.className = "svi nsi";
    dv.style.width = svldw - pad * 2 + "px";
    dv.style.height = svldh + "px";
    dv.style.position = "absolute";
    dv.style.borderRadius = "4px";
    dv.style.background = "#333366";
    dv.style.cursor = "pointer";
    dv.style.userSelect = "none";
    dv.style.webkitUserSelect = "none";
    dv.style.mozUserSelect = "none";
    dv.style.msUserSelect = "none";
    var dvt = document.createElement("div");
    dv.appendChild(dvt);
    dvt.style.position = "absolute";
    dvt.style.textAlign = "center";
    dvt.style.color = "#FFFFFF";
    dvt.style.width = svldw - pad * 2 + "px";
    dvt.style.height = svldh + "px";
    dvt.style.lineHeight = dvt.style.height;
    dvt.style.left = "0px";
    dvt.style.top = "0px";
    dvt.style.textShadow = textShadowStyles;
    dvt.style.fontWeight = "bold";
    dvt.style.textAlign =
      "left";
    dvt.style.fontFamily = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
    dvt.style.fontSize = "20px";
    dvt.textContent = "\u00a0\u00a0" + o.sid;
    var k;
    var v;
    if (o.ptm < 65) {
      k = 0;
      v = (o.ptm - 0) / (65 - 0)
    } else if (o.ptm < 135) {
      k = 1;
      v = (o.ptm - 65) / (135 - 65)
    } else if (o.ptm < 210) {
      k = 2;
      v = (o.ptm - 135) / (210 - 135)
    } else if (o.ptm < 300) {
      k = 3;
      v = (o.ptm - 210) / (300 - 210)
    } else {
      k = 4;
      v = 0
    }
    if (i == 0)
      if (k >= 1) {
        k = 0;
        v = 1
      } if (k == ping_rs.length - 1) {
      var rr = ping_rs[k];
      var gg = ping_gs[k];
      var bb = ping_bs[k]
    } else {
      var rr = ping_rs[k] + (ping_rs[k + 1] - ping_rs[k]) * v;
      var gg =
        ping_gs[k] + (ping_gs[k + 1] - ping_gs[k]) * v;
      var bb = ping_bs[k] + (ping_bs[k + 1] - ping_bs[k]) * v
    }
    var rs = "00" + Math.floor(rr).toString(16);
    var gs = "00" + Math.floor(gg).toString(16);
    var bs = "00" + Math.floor(bb).toString(16);
    rs = rs.substr(rs.length - 2);
    gs = gs.substr(gs.length - 2);
    bs = bs.substr(bs.length - 2);
    var cs = "#" + rs + gs + bs;
    var pbc = ping_rs.length - 1;
    var pww = 40;
    var phh = 36;
    var cc = document.createElement("canvas");
    cc.width = pww;
    cc.height = phh;
    var ctx = cc.getContext("2d");
    ctx.fillStyle = cs;
    for (var j = 1; j <= pbc; j++) {
      var h = j / pbc * (32 -
        4);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#000000";
      ctx.fillRect(2 + (j - 1) * (pww / 4) - 1, 32 - h - 1, 6 + 2, h + 2);
      ctx.fillStyle = cs;
      if (j == 1 + pbc - k) ctx.globalAlpha = .25 + .75 * (1 - v);
      else if (j <= 1 + pbc - k) ctx.globalAlpha = 1;
      else ctx.globalAlpha = .25;
      ctx.fillRect(2 + (j - 1) * (pww / 4), 32 - h, 6, h)
    }
    var ptt = document.createElement("div");
    dv.appendChild(ptt);
    ptt.style.position = "absolute";
    ptt.style.textAlign = "center";
    ptt.style.color = cs;
    ptt.style.width = pww + "px";
    ptt.style.whiteSpace = "nowrap";
    ptt.style.height = "12px";
    ptt.style.right = "4px";
    ptt.style.bottom =
      "1px";
    ptt.style.fontFamily = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
    ptt.style.fontSize = "10px";
    ptt.style.opacity = .6;
    if (o.ptm < 5E4) ptt.textContent = o.ptm + " ms";
    var ii = document.createElement("img");
    ii.src = cc.toDataURL();
    ii.className = "nsi";
    ii.draggable = false;
    ii.style.position = "absolute";
    ii.style.right = "4px";
    ii.style.top = "1px";
    dv.appendChild(ii);
    dv.onclick = function() {
      for (var i = 0; i < serverList.length; i++) {
        var o = serverList[i];
        if (o.dv == this) {
          chooseServer(o);
          hideServers();
          break
        }
      }
    };
    svli.appendChild(dv);
    svl_divs.push(dv);
    o.dv = dv;
    o.div_x = 10 + pad + dx * (svldw + pad);
    o.div_y = 80 + 10 + dy * (svldh + pad * 2);
    dv.style.left = o.div_x + "px";
    dv.style.top = o.div_y + "px";
    if (o.sid == csid) chooseServer(o)
  }
  svlhh = 80 + 20 + dy * (svldh + pad * 2) + svldh + 32;
  svl.style.height = svlhh + "px";
  svli.style.height = svlhh - 32 + "px";
  svl.style.top = Math.round(hh / 2 - svlhh / 2) + "px";
  nicknameInput.disabled = true;
  svl_hiding = false;
  svl_showing = true;
  svl_bg.style.display = "inline";
  svl.style.display = "inline";
  svit_lv = svit.value;
  var ov = svit.value;
  svit.value = 0;
  svit.value = ov;
  svit.disabled = false;
  svit.blur();
  svibs.focus()
}

function hideServers() {
  choosing_server = false;
  if (!svl_hiding) {
    nicknameInput.disabled = false;
    svit.disabled = true;
    nicknameInput.focus()
  }
  svl_hiding = true;
  svl_showing = false
}

function scaleSvl() {
  var sc = Math.round(1E4 * (.9 + .1 * Math.pow(svl_a, .4))) / 1E4;
  if (ww < svlww + 60) sc *= ww / (svlww + 60);
  sc = Math.round(sc * 1E4) / 1E4;
  svl.style.webkitTransform = svl.style.OTransform = svl.style.msTransform = svl.style.MozTransform = svl.style
    .transform = "scale(" + sc + "," + sc + ")"
}
var svlo = null;
var svl_divs = [];
var svl_a = 0;
var svl_showing = false;
var svl_hiding = false;
var svl_bg = document.createElement("div");
svl_bg.style.position = "fixed";
svl_bg.style.left = svl_bg.style.top = "0px";
svl_bg.style.background = "#182230";
svl_bg.style.zIndex = 100;
svl_bg.style.opacity = 0;
svl_bg.style.display = "none";
document.body.appendChild(svl_bg);
svl_bg.onclick = function() {
  hideServers()
};
var svlpad = 7;
var svldw = 120;
var svldh = 48;
var svlww = 20 + svldw * 5 + svlpad * 4 + 32;
var svlhh = 20 + 560;
var svl = document.createElement("div");
svl.style.position = "fixed";
svl.style.width = svlww + "px";
svl.style.height = svlhh + "px";
svl.style.borderRadius = "26px";
svl.style.border = "2px solid rgba(190, 210, 255, .66)";
svl.style.boxShadow = "0px 6px 50px rgba(0,0,0, 1)";
svl.style.background = "#000000";
svl.style.zIndex = 1001;
svl.style.opacity = 0;
svl.style.display = "none";
document.body.appendChild(svl);
var svli = document.createElement("div");
svli.style.position = "absolute";
svli.style.left = "16px";
svli.style.top = "16px";
svli.style.width = svlww - 32 + "px";
svli.style.height = svlhh - 32 + "px";
svli.style.borderRadius = "8px";
svli.style.overflowX = "hidden";
svli.style.overflowY = "hidden";
svl.appendChild(svli);
var svibs = document.createElement("input");
svibs.style.opacity = 0;
svibs.style.position = "fixed";
svibs.style.left = "-100000px";
svl.appendChild(svibs);
svibs.addEventListener("focus", function() {
  svibs.blur()
});
var svitl = document.createElement("div");
svitl.className = "nsi";
svitl.style.pointerEvents = "none";
svitl.style.position = "absolute";
svitl.style.width = "260px";
svitl.style.top = "17px";
svitl.style.left = Math.round(svlww / 2 - 260 / 2) + "px";
svitl.style.height = "30px";
svitl.style.color = "#8068C0";
svitl.style.textAlign = "center";
svitl.style.fontSize = "14px";
svitl.style.fontFamily = "'Lucida Sans Unicode', 'Lucida Grande', sans-serif";
svitl.textContent = "Current server ID:";
svl.appendChild(svitl);
var svitww = 80;
var svith = document.createElement("div");
svl.appendChild(svith);
svith.style.position = "absolute";
svith.className = "taho";
svith.style.width = svitww + "px";
svith.style.left = Math.round(svlww / 2 - svitww / 2) + "px";
svith.style.top = "43px";
svith.style.background = "#4C447c";
svith.style.boxShadow = "0px 6px 50px rgba(0,0,0,1)";
var svit = document.createElement("input");
svith.appendChild(svit);
svit.className = "sumsginp";
svit.style.width = svitww - 20 + "px";
svit.style.height = "24px";
svit.style.textAlign = "center";
svit.inputMode = "numeric";
svit.maxLength = 4;
svit.disabled = true;
var svit_lv = "";
svit.addEventListener("input", function(e) {
  if (choosing_server) {
    this.value = this.value.replace(/[^0-9]/g, "");
    if (svit_lv != this.value) {
      svit_lv = this.value;
      var sid = Number(this.value);
      for (var i = 0; i < serverList.length; i++)
        if (serverList[i].sid == sid) {
          chooseServer(serverList[i]);
          if (!serverList[i].dv) serverList[i].active = true;
          hideServers();
          break
        }
    }
  }
});
svit.onclick = function() {
  svit.value = ""
};
svit.addEventListener("blur", function() {
  if (forcing && bestServer) svit.value = bestServer.sid;
  else if (forcedBestServer) svit.value = forcedBestServer.sid
});
var buildia_shown = false;
var build_v = document.createElement("video");
var bv_width = 1095;
var bv_height = 616;
var buildia_close_after_tm = -1;

function reposBuildia() {
  if (build_v) {
    var sc = Math.min(ww / bv_width, hh / bv_height);
    var vw = Math.ceil(bv_width * sc);
    var vh = Math.ceil(bv_height * sc);
    build_v.style.width = vw + "px";
    build_v.style.height = vh + "px";
    build_v.style.left = Math.floor(ww / 2 - vw / 2) + "px";
    build_v.style.top = Math.floor(hh / 2 - vh / 2) + "px"
  }
}

function trySkipBuildia() {
  if (buildia_shown)
    if (window.ut_csk) {
      var dprey = window.ut_dprey;
      buildia_shown = false;
      showAd = false;
      ut_d.removeChild(build_v);
      document.body.removeChild(ut_d);
      document.body.removeChild(ut_sk);
      clearInterval(ut_cd_iv);
      build_v = null
    }
}
window.buildia = function() {
  buildia_shown = true;
  window.ut_ldt = timeObject.now();
  var d = document.createElement("div");
  d.style.zIndex = 2147483632;
  d.style.width = "100%";
  d.style.height = "100%";
  d.style.textAlign = "center";
  d.style.background = "rgba(0, 0, 0, .85)";
  d.style.margin = "0px";
  d.style.overflow = "hidden";
  d.style.position = "fixed";
  d.style.opacity = 1;
  window.ut_d = d;
  document.body.appendChild(d);
  var v = build_v;
  v.width = bv_width;
  v.height = bv_height;
  v.style.position = "absolute";
  d.appendChild(v);
  v.currentTime = 4;
  v.play();
  buildia_close_after_tm =
    timeObject.now() + 11E3;
  reposBuildia();
  var sk = document.createElement("div");
  window.ut_sk = sk;
  sk.style.width = "115px";
  sk.style.height = "20px";
  sk.style.background = "rgba(0, 0, 0, 1)";
  sk.style.border = "1px solid rgba(255, 255, 255, .5)";
  sk.style.fontFamily = "Verdana";
  sk.style.color = "#ffffff";
  sk.style.position = "fixed";
  sk.style.right = "10px";
  sk.style.bottom = "10px";
  sk.textContent = "Skip Ad " + String.fromCharCode(9654);
  sk.style.cursor = "pointer";
  sk.style.textAlign = "center";
  sk.style.padding = "8px";
  sk.style.fontSize = "16px";
  sk.style.borderRadius = "4px";
  sk.style.opacity = .75;
  sk.className = "nsi";
  sk.style.zIndex = 2147483633;
  sk.onmouseenter = function() {
    ut_sk.style.opacity = 1
  };
  sk.onmouseleave = function() {
    ut_sk.style.opacity = .75
  };
  sk.onclick = function() {
    trySkipBuildia()
  };
  document.body.appendChild(sk);
  window.ut_skf = function() {
    var ct = timeObject.now();
    var v = -1;
    if (window.ut_dprey == "1") v = 0;
    if (v <= 0) {
      ut_sk.textContent = "Skip Ad " + String.fromCharCode(9654);
      window.ut_csk = true
    } else {
      v = Math.ceil(Math.pow(v / 5E3, 1) * 5);
      ut_sk.textContent = "Skip in " + v
    }
  };
  window.ut_cd_iv = setInterval("ut_skf()", 250);
  ut_skf()
};
var fifth_iv = -1;
window.fifthia = function() {
  window.ut_ldt = timeObject.now();
  var d = document.createElement("div");
  d.style.zIndex = 2147483632;
  d.style.width = "100%";
  d.style.height = "100%";
  d.style.textAlign = "center";
  d.style.background = "rgba(0, 0, 0, .85)";
  d.style.margin = "0px";
  d.style.overflow = "hidden";
  d.style.position = "fixed";
  window.ut_d = d;
  document.body.appendChild(d);
  var v = document.createElement("div");
  v.style.background = 'url("/s/fifthsun3.jpg")';
  v.style.width = "1100px";
  v.style.height = "800px";
  v.style.marginTop = "30px";
  v.style.marginLeft =
    v.style.marginRight = "auto";
  v.style.position = "relative";
  v.style.border = "3px solid #CCDDFF";
  window.ut_v = v;
  d.appendChild(v);
  var sn = document.createElement("div");
  sn.style.boxShadow = "0px 3px 20px rgba(0,0,0, .75)";
  sn.style.position = "absolute";
  sn.style.left = Math.round((825 - 150) / 2) - 18 + "px";
  sn.style.top = "126px";
  sn.style.width = "150px";
  sn.style.padding = "18px";
  sn.style.textAlign = "center";
  sn.style.color = "#000000";
  sn.style.fontWeight = "bold";
  sn.style.textAlign = "center";
  sn.style.fontFamily = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
  sn.style.fontSize = "23px";
  sn.style.cursor = "pointer";
  sn.textContent = "Shop Now";
  sn.className = "nsi shbtn";
  var a = document.createElement("a");
  a.className = "btnt";
  a.draggable = false;
  a.href = "https://www.fifthsun.com/brands/video-games/slither-io";
  a.target = "_blank";
  a.appendChild(sn);
  v.appendChild(a);
  window.ut_sn = sn;
  var sk = document.createElement("div");
  window.ut_sk = sk;
  sk.style.width = "115px";
  sk.style.height = "20px";
  sk.style.background = "rgba(0, 0, 0, 1)";
  sk.style.border = "1px solid rgba(255, 255, 255, .5)";
  sk.style.fontFamily =
    "Verdana";
  sk.style.color = "#ffffff";
  sk.style.position = "fixed";
  sk.style.right = "10px";
  sk.style.bottom = "10px";
  sk.textContent = "Skip Ad " + String.fromCharCode(9654);
  sk.style.cursor = "pointer";
  sk.style.textAlign = "center";
  sk.style.padding = "8px";
  sk.style.fontSize = "16px";
  sk.style.borderRadius = "4px";
  sk.style.opacity = .75;
  sk.className = "nsi";
  sk.style.zIndex = 2147483633;
  sk.onclick = function() {
    var dprey = window.ut_dprey;
    if (window.ut_csk) {
      showAd = false;
      ut_d.removeChild(ut_v);
      document.body.removeChild(ut_d);
      document.body.removeChild(ut_sk);
      clearInterval(ut_cd_iv)
    }
  };
  sk.onmouseenter = function() {
    ut_sk.style.opacity = 1
  };
  sk.onmouseleave = function() {
    ut_sk.style.opacity = .75
  };
  document.body.appendChild(sk);
  window.ut_skf = function() {
    var ct = timeObject.now();
    var v = -1;
    if (window.ut_dprey == "1") v = 0;
    if (v <= 0) {
      ut_sk.textContent = "Skip Ad " + String.fromCharCode(160, 9654);
      window.ut_csk = true
    } else {
      v = Math.ceil(Math.pow(v / 5E3, 1) * 5);
      ut_sk.textContent = "Skip in " + v
    }
  };
  window.ut_cd_iv = setInterval("ut_skf()", 250);
  ut_skf()
};
var partycity_shown = false;
var pcy_width = 1100 + 32;
var pcy_height = 800 + 32;
var partycity_iv = -1;
window.partycityia = function() {
  window.ut_ldt = timeObject.now();
  var d = document.createElement("div");
  d.style.zIndex = 2147483632;
  d.style.width = "100%";
  d.style.height = "100%";
  d.style.textAlign = "center";
  d.style.background = "rgba(0, 0, 0, .85)";
  d.style.margin = "0px";
  d.style.overflow = "hidden";
  d.style.position = "fixed";
  window.ut_d = d;
  document.body.appendChild(d);
  var v = document.createElement("div");
  v.style.background = 'url("/s/partycity2.jpg")';
  v.style.width = "1100px";
  v.style.height = "800px";
  v.style.position = "absolute";
  v.style.border = "3px solid #CCDDFF";
  v.style.borderRadius = "42px";
  window.ut_v = v;
  d.appendChild(v);
  var sn = document.createElement("div");
  sn.style.boxShadow = "0px 3px 20px rgba(0,0,0, .75)";
  sn.style.position = "absolute";
  sn.style.left = Math.round((1100 - 244) / 2) - 18 + "px";
  sn.style.top = "707px";
  sn.style.width = "244px";
  sn.style.padding = "18px";
  sn.style.textAlign = "center";
  sn.style.color = "#000000";
  sn.style.fontWeight = "bold";
  sn.style.textAlign = "center";
  sn.style.fontFamily = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
  sn.style.fontSize = "36px";
  sn.style.cursor = "pointer";
  sn.style.borderRadius = "12px";
  sn.textContent = "Shop Now";
  sn.className = "nsi shbtn";
  var a = document.createElement("a");
  a.className = "btnt";
  a.draggable = false;
  if (testing) a.href = "https://www.zombo.com/";
  else a.href = "https://www.partycity.com/slither-party-supplies?extcmp=dsp|banner|slither.io|slitherpartysupplies";
  a.target = "_blank";
  a.appendChild(sn);
  v.appendChild(a);
  window.ut_sn = sn;
  var sk = document.createElement("div");
  window.ut_sk = sk;
  sk.style.width = "115px";
  sk.style.height = "20px";
  sk.style.background = "rgba(0, 0, 0, 1)";
  sk.style.border = "1px solid rgba(255, 255, 255, .5)";
  sk.style.fontFamily = "Verdana";
  sk.style.color = "#ffffff";
  sk.style.position = "fixed";
  sk.style.right = "10px";
  sk.style.bottom = "10px";
  sk.textContent = "Skip Ad " + String.fromCharCode(9654);
  sk.style.cursor = "pointer";
  sk.style.textAlign = "center";
  sk.style.padding = "8px";
  sk.style.fontSize = "16px";
  sk.style.borderRadius = "4px";
  sk.style.opacity = .75;
  sk.className = "nsi";
  sk.style.zIndex = 2147483633;
  sk.onclick = function() {
    var dprey =
      window.ut_dprey;
    if (window.ut_csk) {
      showAd = false;
      ut_d.removeChild(ut_v);
      document.body.removeChild(ut_d);
      document.body.removeChild(ut_sk);
      clearInterval(ut_cd_iv);
      partycity_shown = false
    }
  };
  sk.onmouseenter = function() {
    ut_sk.style.opacity = 1
  };
  sk.onmouseleave = function() {
    ut_sk.style.opacity = .75
  };
  document.body.appendChild(sk);
  window.ut_skf = function() {
    var ct = timeObject.now();
    var v = -1;
    if (window.ut_dprey == "1") v = 0;
    if (v <= 0) {
      ut_sk.textContent = "Skip Ad " + String.fromCharCode(160, 9654);
      window.ut_csk = true
    } else {
      v = Math.ceil(Math.pow(v /
        5E3, 1) * 5);
      ut_sk.textContent = "Skip in " + v
    }
  };
  window.ut_cd_iv = setInterval("ut_skf()", 250);
  ut_skf();
  partycity_shown = true;
  reposPartyCity()
};

function reposPartyCity() {
  if (partycity_shown) {
    var sc = Math.min(ww / pcy_width, hh / pcy_height);
    if (sc > 1) sc = 1;
    var vw = Math.ceil(pcy_width * sc);
    var vh = Math.ceil(pcy_height * sc);
    setTransform(ut_v, "scale(" + sc + "," + sc + ")");
    setTransformOrigin(ut_v, "0% 0%");
    ut_v.style.left = Math.floor(ww / 2 - vw / 2) + "px";
    ut_v.style.top = Math.floor(hh / 2 - vh / 2) + "px"
  }
}
var mba = null;
var mbi = null;
if (is_ios || is_android) {
  mba = document.createElement("a");
  mbi = document.createElement("img");
  mbi.border = 0;
  mbi.draggable = false;
  mbi.className = "nsi";
  mbi.width = 1245;
  mbi.height = 260;
  mbi.style.position = "fixed";
  mbi.style.left = "0px";
  mbi.style.bottom = "0px";
  mbi.style.zIndex = 70;
  mbi.src = "http://slither.io/s/n2.jpg";
  mba.appendChild(mbi);
  document.body.appendChild(mba);
  if (is_ios) mba.href = "https://itunes.apple.com/us/app/slither.io/id1091944550?ls=1&mt=8";
  else if (is_android)
    if (is_amazon) mba.href = "http://www.amazon.com/Lowtech-Enterprises-slither-io/dp/B01E312TYQ/";
    else mba.href = "https://play.google.com/store/apps/details?id=air.com.hypah.io.slither"
}
var app;
var root = null;
var nmlo;
var fdglo;
var fdlo;
var prlo;
var g2lo;
var prglo;
var suglo;
var shilo;
var slilo;
var sfilo;
var sdilo;
var bgi;
if (useWebGL)(async () => {
  app = new PIXI.Application({
    background: "#202020",
    resizeTo: window,
    antialias: true
  });
  var padding = 8;
  var packer;
  for (var j = 0; j < texture_sheets.length; j++) {
    var o = texture_sheets[j];
    var cc = o.cc;
    var ctx = cc.getContext("2d");
    packer = new RectanglePacker(o.width, o.height, padding);
    var subtextures = [];
    for (var i = textures.length - 1; i >= 0; i--) {
      var txu = textures[i];
      if (txu.sheet == j) subtextures.push(txu)
    }
    for (var i = subtextures.length - 1; i >= 0; i--) {
      var txu = subtextures[i];
      packer.insertRectangle(txu.cc.width, txu.cc.height,
        i)
    }
    packer.packRectangles(true);
    if (testing) console.log("packer.rectangleCount = " + packer.rectangleCount());
    var r;
    for (var i = subtextures.length - 1; i >= 0; i--) {
      var ti = packer.getRectangleId(i);
      if (ti == -1) {
        if (testing) console.log("lost a rectangle for subtexture " + i)
      } else {
        r = packer.getRectangle(i, null);
        var txu = subtextures[ti];
        txu.r = r;
        ctx.drawImage(txu.cc, r.x, r.y)
      }
    }
    o.t = PIXI.Texture.from(o.cc);
    for (var i = subtextures.length - 1; i >= 0; i--) {
      var txu = subtextures[i];
      r = txu.r;
      var r2 = new PIXI.Rectangle(r.x, r.y, r.width, r.height);
      txu.t = new PIXI.Texture(o.t.baseTexture, r2)
    }
  }
  document.body.appendChild(app.view);
  app.view.style.position = "fixed";
  app.view.style.left = "0px";
  app.view.style.top = "0px";
  app.view.style.opacity = 0;
  var bgi;
  try {
    var pre = "https://slither.io/s2/";
    bgi = await PIXI.Assets.load(pre + "bg54.jpg")
  } catch (e) {}
  for (var i = 0; i >= 0; i--) {
    if (i == 0) bgee = new PIXI.TilingSprite(bgi, app.screen.width, app.screen.height);
    else bgee = new PIXI.TilingSprite(bgi2, app.screen.width, app.screen.height);
    bgee.anchor.set(.5, .5);
    var o = {};
    o.bgee = bgee;
    o.speed =
      1 - i * .2;
    bgees.push(o)
  }
  root = new PIXI.Container;
  app.stage.addChild(root);
  for (var i = 0; i < bgees.length; i++) root.addChild(bgees[i].bgee);
  fdlo = new PIXI.Container;
  root.addChild(fdlo);
  fdglo = new PIXI.Container;
  fdglo.blendMode = PIXI.BLEND_MODES.ADD;
  root.addChild(fdglo);
  nmlo = new PIXI.Container;
  root.addChild(nmlo);
  prlo = new PIXI.Container;
  prlo.blendMode = PIXI.BLEND_MODES.ADD;
  root.addChild(prlo);
  suglo = new PIXI.Container;
  suglo.blendMode = PIXI.BLEND_MODES.ADD;
  root.addChild(suglo);
  shilo = new PIXI.Container;
  root.addChild(shilo);
  slilo = new PIXI.Container;
  root.addChild(slilo);
  sfilo = new PIXI.Container;
  sfilo.blendMode = PIXI.BLEND_MODES.ADD;
  root.addChild(sfilo);
  sdilo = new PIXI.Container;
  sdilo.blendMode = PIXI.BLEND_MODES.ADD;
  root.addChild(sdilo);
  g2lo = new PIXI.Container;
  g2lo.blendMode = PIXI.BLEND_MODES.ADD;
  root.addChild(g2lo);
  prglo = new PIXI.Container;
  prglo.blendMode = PIXI.BLEND_MODES.ADD;
  root.addChild(prglo);
  app.ticker.add(time => {});
  if (testing) {
    const gl = app.renderer.gl;
    const originalDrawElements = gl.drawElements;
    const originalDrawArrays =
      gl.drawArrays;
    let drawCallCount = 0;
    gl.drawElements = function() {
      drawCallCount++;
      originalDrawElements.apply(gl, arguments)
    };
    gl.drawArrays = function() {
      drawCallCount++;
      originalDrawArrays.apply(gl, arguments)
    };
    const statsText = new PIXI.Text("", {
      fontFamily: "Arial",
      fontSize: 24,
      fill: 16777215
    });
    statsText.position.set(20, 20);
    app.stage.addChild(statsText);
    app.ticker.add(() => {
      statsText.text = `Draw Calls: ${drawCallCount}`;
      drawCallCount = 0
    })
  }
  resize()
})();
resize();
recalculateActivatedCosmetics();
var o = {};
o.f = function(d, m, o) {
  if (m == "success") loadSos(d)
};
getData("https://slither.io/i80124.txt", o);