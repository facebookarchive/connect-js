/**
 * Derived from http://pajhome.org.uk/crypt/md5/md5.html.
 * Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 *
 * Copyright (c) 2009, Facebook
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *  * Neither the name Facebook nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 *
 *
 * @provides fb.md5sum
 * @requires fb.prelude
 */

/**
 * Generate MD5 Sum for the given input string.
 *
 * @access private
 * @param input {String} the data
 * @return {String} the hex md5
 */
FB.md5sum = function(input) {
  // FLOW: input -> utf8 input -> bin input -> bin md5 -> utf8 md5 -> hex md5
  var
    hex_vocab = '0123456789abcdef',

    raw_input = '',
    raw_input_bits_len,
    bin_input,
    bin_md5,
    raw_md5 = '',
    hex_md5 = '',

    i = -1,
    x,
    y;


  function safe_add(x, y) {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF);
    return (((x >> 16) + (y >> 16) + (lsw >> 16)) << 16) | (lsw & 0xFFFF);
  }

  // basic operations
  function cmn(q, a, b, x, s, t) {
    var num = safe_add(safe_add(a, q), safe_add(x, t));
    return safe_add((num << s) | (num >>> (32 - s)), b);
  }
  function ff(a, b, c, d, x, s, t) {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
  }
  function gg(a, b, c, d, x, s, t) {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t);
  }
  function hh(a, b, c, d, x, s, t) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a, b, c, d, x, s, t) {
    return cmn(c ^ (b | (~d)), a, b, x, s, t);
  }


  // encode string to utf-8
  while (++i < input.length) {
    /* decode utf-16 surrogate pairs */
    x = input.charCodeAt(i);
    y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
    if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
      x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
      i++;
    }

    /* encode raw_input as utf-8 */
    if (x <= 0x7F) {
      raw_input += String.fromCharCode(x);
    } else if (x <= 0x7FF) {
      raw_input += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
                                       0x80 | ( x         & 0x3F));
    } else if (x <= 0xFFFF) {
      raw_input += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                                       0x80 | ((x >>> 6 ) & 0x3F),
                                       0x80 | ( x         & 0x3F));
    } else if (x <= 0x1FFFFF) {
      raw_input += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                                       0x80 | ((x >>> 12) & 0x3F),
                                       0x80 | ((x >>> 6 ) & 0x3F),
                                       0x80 | ( x         & 0x3F));
    }
  }


  // number of bits in the raw utf-8 string
  raw_input_bits_len = raw_input.length * 8;


  // string to little-endian array words
  bin_input = Array(raw_input.length >> 2);
  for (i = 0; i < bin_input.length; i++) {
    bin_input[i] = 0;
  }
  for (i = 0; i < raw_input_bits_len; i += 8) {
    bin_input[i>>5] |= (raw_input.charCodeAt(i / 8) & 0xFF) << (i%32);
  }


  // calculate md5 as little-endian array words
  // padding
  bin_input[raw_input_bits_len >> 5] |= 0x80 << ((raw_input_bits_len) % 32);
  bin_input[(((raw_input_bits_len + 64) >>> 9) << 4) + 14] = raw_input_bits_len;

  var
    a =  1732584193,
    b = -271733879,
    c = -1732584194,
    d =  271733878;

  for (i = 0; i < bin_input.length; i += 16) {
    var
      olda = a,
      oldb = b,
      oldc = c,
      oldd = d;

    a = ff(a, b, c, d, bin_input[i+ 0], 7 , -680876936);
    d = ff(d, a, b, c, bin_input[i+ 1], 12, -389564586);
    c = ff(c, d, a, b, bin_input[i+ 2], 17,  606105819);
    b = ff(b, c, d, a, bin_input[i+ 3], 22, -1044525330);
    a = ff(a, b, c, d, bin_input[i+ 4], 7 , -176418897);
    d = ff(d, a, b, c, bin_input[i+ 5], 12,  1200080426);
    c = ff(c, d, a, b, bin_input[i+ 6], 17, -1473231341);
    b = ff(b, c, d, a, bin_input[i+ 7], 22, -45705983);
    a = ff(a, b, c, d, bin_input[i+ 8], 7 ,  1770035416);
    d = ff(d, a, b, c, bin_input[i+ 9], 12, -1958414417);
    c = ff(c, d, a, b, bin_input[i+10], 17, -42063);
    b = ff(b, c, d, a, bin_input[i+11], 22, -1990404162);
    a = ff(a, b, c, d, bin_input[i+12], 7 ,  1804603682);
    d = ff(d, a, b, c, bin_input[i+13], 12, -40341101);
    c = ff(c, d, a, b, bin_input[i+14], 17, -1502002290);
    b = ff(b, c, d, a, bin_input[i+15], 22,  1236535329);

    a = gg(a, b, c, d, bin_input[i+ 1], 5 , -165796510);
    d = gg(d, a, b, c, bin_input[i+ 6], 9 , -1069501632);
    c = gg(c, d, a, b, bin_input[i+11], 14,  643717713);
    b = gg(b, c, d, a, bin_input[i+ 0], 20, -373897302);
    a = gg(a, b, c, d, bin_input[i+ 5], 5 , -701558691);
    d = gg(d, a, b, c, bin_input[i+10], 9 ,  38016083);
    c = gg(c, d, a, b, bin_input[i+15], 14, -660478335);
    b = gg(b, c, d, a, bin_input[i+ 4], 20, -405537848);
    a = gg(a, b, c, d, bin_input[i+ 9], 5 ,  568446438);
    d = gg(d, a, b, c, bin_input[i+14], 9 , -1019803690);
    c = gg(c, d, a, b, bin_input[i+ 3], 14, -187363961);
    b = gg(b, c, d, a, bin_input[i+ 8], 20,  1163531501);
    a = gg(a, b, c, d, bin_input[i+13], 5 , -1444681467);
    d = gg(d, a, b, c, bin_input[i+ 2], 9 , -51403784);
    c = gg(c, d, a, b, bin_input[i+ 7], 14,  1735328473);
    b = gg(b, c, d, a, bin_input[i+12], 20, -1926607734);

    a = hh(a, b, c, d, bin_input[i+ 5], 4 , -378558);
    d = hh(d, a, b, c, bin_input[i+ 8], 11, -2022574463);
    c = hh(c, d, a, b, bin_input[i+11], 16,  1839030562);
    b = hh(b, c, d, a, bin_input[i+14], 23, -35309556);
    a = hh(a, b, c, d, bin_input[i+ 1], 4 , -1530992060);
    d = hh(d, a, b, c, bin_input[i+ 4], 11,  1272893353);
    c = hh(c, d, a, b, bin_input[i+ 7], 16, -155497632);
    b = hh(b, c, d, a, bin_input[i+10], 23, -1094730640);
    a = hh(a, b, c, d, bin_input[i+13], 4 ,  681279174);
    d = hh(d, a, b, c, bin_input[i+ 0], 11, -358537222);
    c = hh(c, d, a, b, bin_input[i+ 3], 16, -722521979);
    b = hh(b, c, d, a, bin_input[i+ 6], 23,  76029189);
    a = hh(a, b, c, d, bin_input[i+ 9], 4 , -640364487);
    d = hh(d, a, b, c, bin_input[i+12], 11, -421815835);
    c = hh(c, d, a, b, bin_input[i+15], 16,  530742520);
    b = hh(b, c, d, a, bin_input[i+ 2], 23, -995338651);

    a = ii(a, b, c, d, bin_input[i+ 0], 6 , -198630844);
    d = ii(d, a, b, c, bin_input[i+ 7], 10,  1126891415);
    c = ii(c, d, a, b, bin_input[i+14], 15, -1416354905);
    b = ii(b, c, d, a, bin_input[i+ 5], 21, -57434055);
    a = ii(a, b, c, d, bin_input[i+12], 6 ,  1700485571);
    d = ii(d, a, b, c, bin_input[i+ 3], 10, -1894986606);
    c = ii(c, d, a, b, bin_input[i+10], 15, -1051523);
    b = ii(b, c, d, a, bin_input[i+ 1], 21, -2054922799);
    a = ii(a, b, c, d, bin_input[i+ 8], 6 ,  1873313359);
    d = ii(d, a, b, c, bin_input[i+15], 10, -30611744);
    c = ii(c, d, a, b, bin_input[i+ 6], 15, -1560198380);
    b = ii(b, c, d, a, bin_input[i+13], 21,  1309151649);
    a = ii(a, b, c, d, bin_input[i+ 4], 6 , -145523070);
    d = ii(d, a, b, c, bin_input[i+11], 10, -1120210379);
    c = ii(c, d, a, b, bin_input[i+ 2], 15,  718787259);
    b = ii(b, c, d, a, bin_input[i+ 9], 21, -343485551);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  bin_md5 = [a, b, c, d];


  // little-endian array words to a string
  for (i = 0; i < bin_md5.length * 32; i += 8) {
    raw_md5 += String.fromCharCode((bin_md5[i>>5] >>> (i % 32)) & 0xFF);
  }


  // convert the raw md5 string to a hex md5 string
  for (i = 0; i < raw_md5.length; i++) {
    x = raw_md5.charCodeAt(i);
    hex_md5 += hex_vocab.charAt((x >>> 4) & 0x0F) + hex_vocab.charAt(x & 0x0F);
  }


  return hex_md5;
};
