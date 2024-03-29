'use strict';

/* global BigInt */

const crypto = require('crypto');
const base91 = require('./base91.js');

/* eslint-disable */
const skein=(function(){var p,q,u,v,w,z,A,B,C,D,E,L;L=function(a,b){this.lo=a?a:0;this.hi=b?b:0};L.clone=function(a){return new L(a.lo,a.hi)};L.prototype={xor:function(a){this.lo^=a.lo;this.hi^=a.hi;return this},plus:(function(){var b,s;b=4*(1<<30);s=function(x,y){var t=x+y;if(x<0){t+=b}if(y<0){t+=b}return t};return function(a){this.lo=s(this.lo,a.lo);this.hi=(s(this.hi,a.hi)+(this.lo>=b?1:0))%b;this.lo=this.lo%b;return this}}()),circ:function(n){var a,m;if(n>=32){a=this.lo;this.lo=this.hi;this.hi=a;n-=32}m=32-n;a=(this.hi<<n)+(this.lo>>>m);this.lo=(this.lo<<n)+(this.hi>>>m);this.hi=a;return this},toString:(function(){var a,o;a=function(n){return("00"+n.toString(16)).slice(-2)};o=function(n){return a(n&255)+a(n>>>8)+a(n>>>16)+a(n>>>24)};return function(){return o(this.lo)+o(this.hi)}}())};p=[0,2,4,6,2,4,6,0,4,6,0,2,6,0,2,4];q=[1,3,5,7,1,7,5,3,1,3,5,7,1,7,5,3];u=String.fromCharCode;v=u(0);w=v+v+v+v;w+=w+w+w;w+=w;z=[[46,36,19,37,33,27,14,42,17,49,36,39,44,9,54,56],[39,30,34,24,13,50,10,17,25,29,39,43,8,35,56,22]];E=function(a,b,c){for(var i=0;i<8;i+=1){C[i].plus(a[(c+i)%9])}C[5].plus(b[c%3]);C[6].plus(b[(c+1)%3]);C[7].plus(new L(c))};D=function(r){var a,b,i;for(i=0;i<16;i+=1){a=p[i];b=q[i];C[a].plus(C[b]);C[b].circ(r[i]).xor(C[a])}};A=function(a,b){var c,d,i,j,e,f,g,h,k,l;l=b.length;if(l%32){b+=w.slice(l%32)}else if(l===0){b=w}d=[];j=0;for(i=0;i<b.length;i+=4){d[j]=new L(b.charCodeAt(i)+b.charCodeAt(i+1)*0x10000,b.charCodeAt(i+2)+b.charCodeAt(i+3)*0x10000);j+=1}g=1<<30;a<<=24;h=d.length-8;for(e=0;e<=h;e+=8){k=(e===h)?[new L(2*l),new L(0,g+a+(1<<31))]:[new L(8*e+64),new L(0,g+a)];k[2]=new L().xor(k[0]).xor(k[1]);c=C;c[8]=new L(0xa9fc1a22,0x1bd11bda);for(i=0;i<8;i+=1){c[8].xor(c[i])}C=d.slice(e,e+8).map(L.clone);for(f=0;f<18;f+=1){E(c,k,f);D(z[f%2])}E(c,k,f);for(i=0;i<8;i+=1){C[i].xor(d[e+i])}g=0}};C=[new L(),new L(),new L(),new L(),new L(),new L(),new L(),new L()];A(4,u(0x4853,0x3341,1,0,512)+w.slice(5,16));B=C;return function(m){C=B.map(L.clone);A(48,m);A(63,v+v+v+v);return C.join("")}}());
/* eslint-enable */

function generator(config) {
  switch (config.version) {
    case 1:
      return v1(config);
    default:
      return v2(config);
  }
}

function v1(config) {
  const hash = skein(config.passphrase + config.salt);
  const start = HexToInt(hash.substring(0, 1)) + HexToInt(hash.substring(1, 2)) + HexToInt(hash.substring(2, 3));
  const end = start + config.length;
  return base91.encode(hash).substring(start, end);
}

function v2(config) {
  const charset = createCustomCharset(config);
  let output = '';

  for (let i = 0; true; i++) {
    if (output.length >= 40) {
      // TODO check if require character types are in password
      break;
    }

    const hash = crypto.createHash('sha256').update(config.passphrase.repeat(i + 1) + config.salt).digest('hex');
    const num = BigInt(`0x${hash}`);
    const encoded = encodeToCustomCharset(num, charset);
    output += encoded;
  }

  return output;
}

function HexToInt(hexString) {
  return parseInt(hexString, 16);
}

function createCustomCharset(config) {
  let charset = '';
  if (!config.noUppers) {
    charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }
  charset += 'abcdefghijklmnopqrstuvwxyz';
  if (!config.noNumbers) {
    charset += '0123456789';
  }
  if (!config.noSpecials) {
    charset += config.customSpecials;
  }
  return charset;
}

function encodeToCustomCharset(num, charset) {
  let ret = '';
  while (num !== BigInt(0)) {
    const remainder = num % BigInt(charset.length);
    num /= BigInt(charset.length);
    ret = charset[Number(remainder)] + ret;
  }
  return ret;
}

module.exports = generator;
