import {useRef,useState} from 'react';
import {Check,Maximize2,Minus,Plus,Move} from 'lucide-react';
import {SCENE_CLASSIFICATION,SCENE_OBJECTS} from './assessment-data';
import type {CaseState} from './assessment-state';
import type {useCaseDrag} from './use-case-drag';

export default function CaseScene({variant,state,selected,onInspect,onSelect,drag}:{variant:'inspect'|'classify';state:CaseState;selected:string|null;onInspect:(id:string)=>void;onSelect:(id:string)=>void;drag?:ReturnType<typeof useCaseDrag>}){
 const [zoom,setZoom]=useState(1);const [pan,setPan]=useState({x:0,y:0});
 const ref=useRef<HTMLDivElement>(null);const panning=useRef<{x:number;y:number;startX:number;startY:number;pointer:number}|null>(null);
 const highlighted=SCENE_OBJECTS.find(o=>o.id===selected||SCENE_CLASSIFICATION[o.id]===selected);
 function changeZoom(value:number){setZoom(Math.max(1,Math.min(2,value)));setPan({x:0,y:0});}
 return <div className="incident-scene">
  <div className="scene-toolbar"><span>Участок насоса P-204</span><div><button aria-label="Уменьшить сцену" disabled={zoom===1} onClick={()=>changeZoom(zoom-.25)}><Minus size={15}/></button><span>{Math.round(zoom*100)}%</span><button aria-label="Увеличить сцену" disabled={zoom===2} onClick={()=>changeZoom(zoom+.25)}><Plus size={15}/></button><button aria-label="Сбросить масштаб сцены" onClick={()=>changeZoom(1)}><Maximize2 size={14}/></button></div></div>
  <div ref={ref} className={`scene-view ${zoom>1?'can-pan':''}`} onPointerDown={e=>{if(zoom<=1||e.button!==0||(e.target as HTMLElement).closest('button'))return;e.preventDefault();panning.current={x:pan.x,y:pan.y,startX:e.clientX,startY:e.clientY,pointer:e.pointerId};e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={e=>{const p=panning.current;if(!p||p.pointer!==e.pointerId||!ref.current)return;const mx=(zoom-1)*ref.current.clientWidth/2,my=(zoom-1)*ref.current.clientHeight/2;setPan({x:Math.max(-mx,Math.min(mx,p.x+e.clientX-p.startX)),y:Math.max(-my,Math.min(my,p.y+e.clientY-p.startY))})}} onPointerUp={e=>{if(panning.current?.pointer===e.pointerId){panning.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)}}} onPointerCancel={()=>{panning.current=null}}>
   <div className="scene-world" style={{transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`}}>
    <img src="/assets/pump-room.webp" alt="Участок насоса P-204: насос, арматура, панель, след на полу, инструмент и документы" draggable={false}/>
    {highlighted&&<div className="scene-selection" style={{left:highlighted.bounds[0]+'%',top:highlighted.bounds[1]+'%',width:highlighted.bounds[2]+'%',height:highlighted.bounds[3]+'%'}}/>}
    {SCENE_OBJECTS.map(o=>{
     const cardId=SCENE_CLASSIFICATION[o.id];const note=variant==='classify'&&!cardId;const done=variant==='inspect'?state.collected.includes(o.id):!!state.placements[cardId];
     const handlers=variant==='classify'&&cardId&&drag?drag.bind(cardId,()=>onSelect(cardId)):{onPointerDown:(e:React.PointerEvent)=>e.stopPropagation(),onClick:()=>onInspect(o.id)};
     return <button key={o.id} {...handlers} className={`scene-pin ${note?'observation-pin':''} ${done?'saved':''} ${selected===cardId||selected===o.id?'selected':''} ${variant==='classify'&&cardId&&!done?'draggable-source':''}`} style={{left:o.point[0]+'%',top:o.point[1]+'%'}} aria-label={`${variant==='classify'&&cardId&&!done?'Выбрать':'Изучить'} ${o.title}`} title={variant==='classify'&&cardId&&!done?'Выберите или перетащите: '+o.title:o.title}><span>{done?<Check size={17}/>:o.number}</span></button>;
    })}
   </div>
   <span className="scene-illustration">Учебная иллюстрация</span>
  </div>
  <div className="scene-bottomline"><Move size={13}/><span>{zoom>1?'Перемещайте увеличенную сцену за фон.':variant==='inspect'?'Откройте метку и добавьте запись в журнал.':'Выберите объект или перетащите его в категорию.'}</span></div>
 </div>;
}
