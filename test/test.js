var fs = require("fs");
var Bitmap = require("../lib/bitmap");
var should = require("chai").should();

function compareImages(file, bitmap) {
	var testContent = fs.readFileSync(file);
	var dataBuffer = new Buffer(new Uint8Array(bitmap.getData()));

	return testContent.toString() == dataBuffer.toString();
}

describe('Bitmap', function() {
	it('should create a valid 2x2 pixels 24bit image', function () {
		var bmp = new Bitmap(2, 2, 24);
		bmp.setPixel(0, 0, 0xFF0000);
		bmp.setPixel(1, 0, 0x00FF00);
		bmp.setPixel(0, 1, 0x0000FF);
		bmp.setPixel(1, 1, 0xFF00FF);

		compareImages("test/2x2_24.bmp", bmp).should.be.true;
	});

	it('should create a valid 200x200 24bit checkboard image', function () {
		var bmp = new Bitmap(200, 200, 24);

		for (var x = 0; x < bmp.width; x++) {
			for (var y = 0; y < bmp.height; y++) {
				var sx = Math.floor(x / 40);
				var sy = Math.floor(y / 40);

				if ((sx + sy) % 2 == 0) {
					bmp.setPixel(x, y, 0xFF0000);
				} else {
					bmp.setPixel(x, y, 0x00FF00);
				}
			}
		}

		// var data = bmp.getData();
		// fs.writeFile("cb_200x200_24.bmp", new Buffer(new Uint8Array(data)));

		compareImages("test/cb_200x200_24.bmp", bmp).should.be.true;
	});

	it('should create a valid 200x200 32bit checkboard image', function () {
		var bmp = new Bitmap(200, 200);

		for (var x = 0; x < bmp.width; x++) {
			for (var y = 0; y < bmp.height; y++) {
				var sx = Math.floor(x / 40);
				var sy = Math.floor(y / 40);

				if ((sx + sy) % 2 == 0) {
					bmp.setPixel(x, y, 0x00FF0000);
				} else {
					bmp.setPixel(x, y, 0x0000FF00);
				}
			}
		}

		compareImages("test/cb_200x200_32.bmp", bmp).should.be.true;
	});

	it('should create a valid 500x300 24bit green gradient', function () {
		var bmp = new Bitmap(500, 300, 24);

		for (var x = 0; x < bmp.width; x++) {
			for (var y = 0; y < bmp.height; y++) {
				var lightness = Math.round(0xFF * (x / bmp.width));

				bmp.setPixel(x, y, (lightness << 16) | ((0xFF - lightness) << 8));
			}
		}

		compareImages("test/gd_500x300_24.bmp", bmp).should.be.true;
	});

	it('should create a valid 256x100 8bit gradient from a palette', function () {
		var bmp = new Bitmap(256, 100, 8);

		for (var i = 0; i < 256; i++) {
			var lightness = Math.round(0xFF * (i / 255));
			bmp.setPaletteColor(i, (lightness << 16) | ((0xFF - lightness) << 8));
		}

		for (var x = 0; x < bmp.width; x++) {
			for (var y = 0; y < bmp.height; y++) {
				bmp.setPixel(x, y, x);
			}
		}

		compareImages("test/gd_256x100_8.bmp", bmp).should.be.true;
	});
});