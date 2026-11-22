// Tiny stack VM for make.fun bounty tiny-stack-vm-01-run-20261122.
// Runs the kit ISA (program.bin + input.bin per instance) and writes
// stdout.bin + exit.txt per instance. Node 22, stdlib only, deterministic.
import{mkdirSync,readdirSync,readFileSync,writeFileSync}from"node:fs";
const I=process.env.MAKEFUN_INPUT_DIR??"/input",O=process.env.MAKEFUN_OUTPUT_DIR??"/output";
// Opcode table: char at index o packs imm/pops/pushes as imm*16+pops*4+pushes,
// stored +36; '#' (35) marks an unknown opcode. Index 0..83, one char per byte.
const T="$5e(*./3########-------)---)---#---#############DHHD$###########),##############((%(";
function r(p,q){
 let D=[],C=[],M=new Int32Array(256),S="",sp=0,cp=0,ip=0,pc=0,st=0;const n=p.length,d=e=>[S,e];
 for(;;){
  if(st===1e6)return d(10);
  if(pc<0||pc>=n)return d(9);
  const o=p[pc],v=(T.charCodeAt(o)||35)-36;
  if(v<0)return d(5);
  const i=v>>4,a=(v>>2)&3,u=v&3;
  if(pc+i>=n)return d(9);
  st++;const x=pc+1+i;
  if(sp<a)return d(2);
  if(sp-a+u>256)return d(3);
  pc=x;
  switch(o){
   case 0:return d(0);
   case 1:D[sp++]=(p[x-1]<<24)>>24;break;
   case 2:D[sp++]=p[x-4]|p[x-3]<<8|p[x-2]<<16|p[x-1]<<24;break;
   case 3:sp--;break;
   case 4:D[sp]=D[sp-1];sp++;break;
   case 5:{const t=D[sp-1];D[sp-1]=D[sp-2];D[sp-2]=t;break;}
   case 6:D[sp]=D[sp-2];sp++;break;
   case 7:{const a=D[sp-3];D[sp-3]=D[sp-2];D[sp-2]=D[sp-1];D[sp-1]=a;break;}
   case 23:D[sp-1]=-D[sp-1]|0;break;
   case 27:D[sp-1]=~D[sp-1];break;
   case 48:case 49:case 50:{const l=((p[x-2]|p[x-1]<<8)<<16)>>16;let t=!0;if(o!==48){const v=D[--sp];t=o===49?v===0:v!==0}if(t)pc=x+l;break;}
   case 51:if(cp===64)return d(7);C[cp++]=x;pc=p[x-2]|p[x-1]<<8;break;
   case 52:if(!cp)return d(8);pc=C[--cp];break;
   case 64:{const a=D[sp-1];if(a<0||a>255)return d(6);D[sp-1]=M[a];break;}
   case 65:{const a=D[sp-1],v=D[sp-2];if(a<0||a>255)return d(6);sp-=2;M[a]=v;break;}
   case 80:{const b=""+D[sp-1];if(S.length+b.length>65536)return d(11);sp--;S+=b;break;}
   case 81:if(S.length+1>65536)return d(11);S+=String.fromCharCode(D[--sp]&255);break;
   case 82:D[sp++]=ip<q.length?q[ip++]:-1;break;
   case 83:return d(D[--sp]&255);
   default:{
    const b=D[sp-1],a=D[sp-2];let v=0;
    if(o===16)v=a+b|0;
    else if(o===17)v=a-b|0;
    else if(o===18)v=Math.imul(a,b);
    else if(o===19){if(!b)return d(4);v=(a/b)|0}
    else if(o===20){if(!b)return d(4);v=a%b|0}
    else if(o===21){if(!b)return d(4);v=Math.floor((a>>>0)/(b>>>0))|0}
    else if(o===22){if(!b)return d(4);v=(a>>>0)%(b>>>0)|0}
    else if(o===24)v=a&b;
    else if(o===25)v=a|b;
    else if(o===26)v=a^b;
    else if(o===28)v=a<<b;
    else if(o===29)v=a>>b;
    else if(o===30)v=a>>>b|0;
    else if(o===32)v=a===b?1:0;
    else if(o===33)v=a<b?1:0;
    else v=(a>>>0)<(b>>>0)?1:0;
    sp-=2;D[sp++]=v;break;
   }
  }
 }
}
for(const id of readdirSync(I).sort()){
 const[o,c]=r(readFileSync(I+"/"+id+"/program.bin"),readFileSync(I+"/"+id+"/input.bin"));
 mkdirSync(O+"/"+id,{recursive:!0});
 writeFileSync(O+"/"+id+"/stdout.bin",Buffer.from(o,"latin1"));
 writeFileSync(O+"/"+id+"/exit.txt",c+"\n");
}
