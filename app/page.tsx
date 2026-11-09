import {useEffect,useState} from 'react';
import {ArrowRight,BookOpen,Clock3,Layers3,ShieldCheck} from 'lucide-react';
import Lecture from './lecture';
import Assessment from './assessment';

export default function Home(){
 const [entered,setEntered]=useState(false);
 const [section,setSection]=useState<'lecture'|'assessment'>('lecture');
 useEffect(()=>{try{setEntered(sessionStorage.getItem('samruk-demo-entered')==='1');const last=localStorage.getItem('samruk-course-section');if(last==='assessment')setSection('assessment')}catch{}},[]);
 function enter(){setEntered(true);try{sessionStorage.setItem('samruk-demo-entered','1')}catch{}}
 function open(next:'lecture'|'assessment'){setSection(next);try{localStorage.setItem('samruk-course-section',next)}catch{}window.scrollTo({top:0,behavior:'instant'})}
 function signOut(){setEntered(false);setSection('lecture');try{sessionStorage.removeItem('samruk-demo-entered');localStorage.setItem('samruk-course-section','lecture')}catch{}window.scrollTo({top:0,behavior:'instant'})}
 if(!entered)return <main className="mock-entry"><header className="entry-header"><div className="brand"><div className="brand-mark"><Layers3 size={25}/></div><div><strong>SAMRUK</strong><span>BUSINESS ACADEMY</span></div></div><span className="entry-label">ДЕМОНСТРАЦИОННЫЙ КУРС</span></header><div className="entry-content"><section className="entry-copy"><div className="entry-eyebrow"><span/>МАСТЕРСКАЯ РАССЛЕДОВАНИЯ</div><h1>Расследование<br/>начинается<br/>с вопросов.</h1><p>Изучите подход вместе с наставником, а потом примените его в самостоятельном расследовании происшествия.</p><button className="primary-button mock-sign-in" onClick={enter}>Sign In<ArrowRight size={19}/></button><div className="entry-course-facts"><span><BookOpen size={17}/>5 уроков</span><span><ShieldCheck size={17}/>CASE 001</span><span><Clock3 size={17}/>В вашем темпе</span></div></section><section className="entry-art" aria-label="Производственный участок"><img src="/assets/pump-room.webp" alt="Учебная производственная сцена с насосом P-204"/><div className="entry-art-label"><span>САМОСТОЯТЕЛЬНЫЙ КЕЙС</span><strong>Выброс на насосе P-204</strong><p>Соберите сведения. Проверьте версии.</p></div><div className="entry-art-mark"><Layers3 size={18}/><span>УЧИМСЯ ЧЕРЕЗ РАССЛЕДОВАНИЕ</span></div></section></div><footer className="entry-footer"><span>Samruk Business Academy · Расследование происшествий</span><span>Прогресс сохраняется в вашем браузере</span></footer></main>;
 return section==='lecture'?<Lecture onAssessment={()=>open('assessment')} onSignOut={signOut}/>:<Assessment onCourse={()=>open('lecture')} onSignOut={signOut}/>;
}
