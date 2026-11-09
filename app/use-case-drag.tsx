import {useEffect,useRef,useState} from 'react';
import type {PointerEvent as ReactPointerEvent,MouseEvent} from 'react';

export function useCaseDrag(onDrop:(id:string,target:string)=>void){
 const [drag,setDrag]=useState<{id:string;x:number;y:number;active:boolean}|null>(null);
 const [over,setOver]=useState<string|null>(null);
 const live=useRef<{id:string;startX:number;startY:number;x:number;y:number;active:boolean;pointer:number}|null>(null);
 const suppressed=useRef(false);const dropRef=useRef(onDrop);dropRef.current=onDrop;
 function targetAt(x:number,y:number){const el=document.elementFromPoint(x,y)?.closest<HTMLElement>('[data-case-drop]');return el?.dataset.caseDrop||null;}
 useEffect(()=>{if(!drag?.active)return;let frame:number;function scroll(){const p=live.current;if(!p?.active)return;const speed=p.y<65?-14:p.y>innerHeight-70?14:0;if(speed){window.scrollBy(0,speed);setOver(targetAt(p.x,p.y));}frame=requestAnimationFrame(scroll);}frame=requestAnimationFrame(scroll);return()=>cancelAnimationFrame(frame);},[drag?.active]);
 function bind(id:string,click:()=>void){return {
  onPointerDown:(e:ReactPointerEvent<HTMLElement>)=>{if(e.button!==0)return;e.stopPropagation();suppressed.current=false;live.current={id,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,active:false,pointer:e.pointerId};e.currentTarget.setPointerCapture(e.pointerId);},
  onPointerMove:(e:ReactPointerEvent<HTMLElement>)=>{const p=live.current;if(!p||p.pointer!==e.pointerId)return;p.x=e.clientX;p.y=e.clientY;if(!p.active&&Math.hypot(p.x-p.startX,p.y-p.startY)<7)return;p.active=true;e.preventDefault();setDrag({id:p.id,x:p.x,y:p.y,active:true});setOver(targetAt(p.x,p.y));},
  onPointerUp:(e:ReactPointerEvent<HTMLElement>)=>{const p=live.current;if(!p||p.pointer!==e.pointerId)return;const target=targetAt(e.clientX,e.clientY);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);live.current=null;setDrag(null);setOver(null);if(p.active){suppressed.current=true;window.setTimeout(()=>{suppressed.current=false},70);if(target)dropRef.current(p.id,target);}},
  onPointerCancel:()=>{live.current=null;setDrag(null);setOver(null);suppressed.current=false;},
  onClick:(e:MouseEvent<HTMLElement>)=>{if(suppressed.current){e.preventDefault();e.stopPropagation();return}click();}
 };}
 return {drag,over,bind};
}
