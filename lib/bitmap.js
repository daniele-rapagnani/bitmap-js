(function() {
	Bitmap = function(width, height, bpp, flipY) {
		bpp = bpp || 32;
		this.width = width;
		this.height = height;
		this.bpp = bpp;
		this.flipY = typeof flipY !== "undefined" ? flipY : true;

		this.rowWidth = this.width * (this.bpp / 8);
		this.rowWidth = Math.ceil(this.rowWidth / 4) * 4;

		this.dataBuffer = new ArrayBuffer(this.getDataLength());
		this.data = new DataView(this.dataBuffer);
		this.pixels = new DataView(this.dataBuffer, 54 + this.getPaletteSize());
		this.palette = null;

		if (this.getPaletteSize()) {
			this.palette = new DataView(this.dataBuffer, 54);
		}

		this.data.setUint16(0, 0x4D42, true);
		this.data.setUint32(2, this.data.byteLength, true);
		this.data.setUint32(10, 54 + this.getPaletteSize(), true);
		this.data.setUint32(14, 40, true);
		this.data.setInt32(18, this.width, true);
		this.data.setInt32(22, this.height * (this.flipY ? -1 : 1), true);
		this.data.setUint16(26, 1, true);
		this.data.setUint16(28, this.bpp, true);
		this.data.setUint32(34, this.rowWidth * this.height);
		this.data.setUint32(42, this.bpp > 16 ? 0 : 0 /* TODO: Palette colors */);
	};

	Bitmap.prototype.setPixel = function(x, y, value) {
		var offset = (this.rowWidth * y) + (x * (this.bpp / 8));

		switch(this.bpp) {
			case 32:
				this.pixels.setUint32(offset, value, true);
				break;

			case 24:
				this.pixels.setUint8(offset, value & 0xFF);
				this.pixels.setUint8(offset + 1, (value >> 8) & 0xFF);
				this.pixels.setUint8(offset + 2, (value >> 16) & 0xFF);
				break;

			case 8:
				this.pixels.setUint8(offset, value & 0xFF);
				break;

			default:
				throw new Exception("Don't know how to set pixels for bpp: " + this.bpp);
		}
	};

	Bitmap.prototype.setPaletteColor = function(index, value) {
		if (!this.palette) {
			return false;
		}

		this.palette.setUint32(index * 4, value, true);

		return true;
	};

	Bitmap.prototype.getPaletteSize = function() {
		if (this.bpp != 8) {
			return 0;
		}

		return Math.pow(2, this.bpp) * 4;
	}

	Bitmap.prototype.getDataLength = function() {
		if (this.bpp != 8 && this.bpp != 24 && this.bpp != 32) {
			throw new Error("Unsupported bpp: " + this.bpp);
		}

		return 54 + (this.rowWidth * this.height) + this.getPaletteSize();
	};

	Bitmap.prototype.getData = function() {
		return this.dataBuffer;
	};

	Bitmap.prototype.getURL = function() {
		var blob = new Blob([ new DataView(this.getData()) ], {type: "application/octet-stream"});
		return URL.createObjectURL(blob);
	};

	if( typeof exports !== 'undefined' ) {
		module.exports = Bitmap;
	} else {
		window.Bitmap = Bitmap;
	}

	return Bitmap;
})();