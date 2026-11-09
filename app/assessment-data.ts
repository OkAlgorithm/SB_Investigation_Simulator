import original from './assessment-original.json';

export type Category = 'position'|'people'|'objects'|'documents';
export type EvidenceCard = {id:string;category:Category;title:string;description:string;explanation:string;person?:string};
export const CATEGORIES:{id:Category;title:string;hint:string}[]=[
 {id:'position',title:'Позиция',hint:'Где находилось и как расположено'},
 {id:'people',title:'Люди',hint:'Кто располагает сведениями'},
 {id:'objects',title:'Предметы',hint:'Вещественные доказательства'},
 {id:'documents',title:'Документы',hint:'Записи и предусмотренный порядок'}
];
export const EVIDENCE_CARDS=original.screen05.cards as EvidenceCard[];
const OBJECT_IDS=['pump','valve','panel','trace','tool','permit','shift-log','procedure'];
export const SCENE_OBJECTS=original.screen04.objects.map((o,i)=>({...o,id:OBJECT_IDS[i],number:i+1}));
export const SCENE_CLASSIFICATION:Record<string,string>={pump:'pump',trace:'position',tool:'tool',permit:'permit','shift-log':'shift-log',procedure:'procedure'};
export const QUESTIONS=[
 {id:'observation',text:'Что именно вы наблюдали перед происшествием?'},
 {id:'leading',text:'Вы знали, что оборудование было неисправно?'},
 {id:'time',text:'В какое время вы заметили происшествие?'},
 {id:'people',text:'Кто ещё находился поблизости?'}
] as const;
export type QuestionId=typeof QUESTIONS[number]['id'];
export const INTERVIEW=original.screen06.entries;
export const INTERVIEW_INTRO='Я работал на соседнем участке и видел, как ремонтная бригада готовилась к техническим работам. Позже услышал громкий звук и заметил, что произошёл выброс рабочей среды.';
export const REQUIRED_TOPICS:QuestionId[]=['observation','time','people'];
export const FIRST_OPTIONS=[
 {id:'a',letter:'А',text:'Согласиться с предварительной версией и зафиксировать нарушение',feedback:'Вы приняли предварительную версию за установленный факт. Сначала нужно собрать сведения и проверить возможные объяснения.'},
 {id:'b',letter:'Б',text:'Организовать сбор доказательств и проверить возможные обстоятельства',feedback:'Вы выбрали объективный подход. Переходите к осмотру места происшествия и сбору доказательств.'},
 {id:'v',letter:'В',text:'Провести повторный инструктаж и закрыть вопрос',feedback:'Вопрос закрывается до проверки обстоятельств. Сначала установите, что произошло и какие условия этому способствовали.'},
 {id:'g',letter:'Г',text:'Запросить объяснительную у пострадавшего работника',feedback:'Объяснения могут дать полезные сведения. Для начала расследования также нужно собрать и проверить другие доказательства.'}
];
export const EVENT_CARDS=[
 {id:'release',title:'Выброс рабочей среды',description:'Свидетель услышал громкий звук и заметил выброс.',time:'Замечен около 09:42',source:'Показания свидетеля',kind:'observation'},
 {id:'work',title:'Начало технических работ',description:'На насосе P-204 проводились технические работы.',time:'Время не установлено',source:'Сообщение диспетчера',kind:'record'},
 {id:'handover',title:'Передача смены',description:'Какие сведения получила следующая смена, предстоит уточнить.',time:'Время не установлено',source:'Журнал передачи смены',kind:'record'},
 {id:'response',title:'Первоначальное реагирование',description:'Диспетчер сообщил о временной остановке участка.',time:'Время не установлено',source:'Сообщение диспетчера',kind:'record'},
 {id:'prep',title:'Подготовка оборудования',description:'Свидетель видел подготовку бригады к работам.',time:'Время не установлено',source:'Показания свидетеля',kind:'observation'},
 {id:'deviation',title:'Возникновение отклонения',description:'Какое отклонение могло произойти, предстоит установить.',time:'Точное время и механизм неизвестны',source:'Рабочая гипотеза сценария',kind:'hypothesis'}
];
export const EXPECTED_ORDER=['handover','prep','work','deviation','release','response'];
export const WHY_PROMPTS=original.screen08.prompts;
export type WhyChoice={text:string;path:string;verify:string};
export const WHY_START=original.screen08.starting as WhyChoice[];
export const WHY_PATHS=original.screen08.paths as Record<string,string[][][]>;
export const WHY_MANAGEMENT=original.screen08.management;
export function whyOptions(index:number,path='open'):WhyChoice[]{
 if(index===0)return WHY_START;
 const variants=index===4?WHY_MANAGEMENT:(WHY_PATHS[path]||WHY_PATHS.open)[index-1];
 return (variants||[]).map(([text,verify])=>({text,verify,path}));
}
export const CAUSE_CANDIDATES=[
 {id:'integrity',title:'Нарушение герметичности оборудования',question:false},
 {id:'technical',title:'Техническая неисправность',question:false},
 {id:'preparation',title:'Недостаточная подготовка оборудования',question:false},
 {id:'condition-control',title:'Недостатки контроля технического состояния',question:false},
 {id:'handover-info',title:'Недостаточная передача информации',question:false},
 {id:'procedure-check',title:'Необходимость проверки процедуры подготовки к ремонту',question:true},
 {id:'responsibility-check',title:'Необходимость проверки распределения ответственности',question:true}
];
export const CASE_MATERIALS=[
 ...SCENE_OBJECTS.map(o=>({id:o.id,title:o.title,text:o.description+' '+o.study})),
 {id:'witness',title:'Показания свидетеля',text:'Видел подготовку бригады и заметил выброс около 09:42. Точное время, операции и действия работников требуют уточнения.'},
 {id:'dispatch',title:'Сообщение диспетчера',text:'Сообщение в 09:42 о выбросе рабочей среды при технических работах на насосе P-204, травме работника и временной остановке участка.'}
];
export const STAGES=[
 {id:1,title:'Начало расследования',short:'Вводная',caption:'Ваша роль и задача'},
 {id:2,title:'Сообщение о происшествии',short:'Оповещение',caption:'Первичные сведения'},
 {id:3,title:'Первое решение',short:'Первое решение',caption:'Выбор подхода к расследованию'},
 {id:4,title:'Осмотр места происшествия',short:'Осмотр',caption:'Восемь объектов и документов'},
 {id:5,title:'Классификация доказательств',short:'Четыре П',caption:'Материалы прямо из сцены'},
 {id:6,title:'Интервью со свидетелем',short:'Интервью',caption:'Личные наблюдения и уточнения'},
 {id:7,title:'Построение хронологии',short:'Хронология',caption:'Рабочая последовательность'},
 {id:8,title:'Метод «Пять почему»',short:'Пять почему',caption:'Версии и способы проверки'},
 {id:9,title:'Дерево причин',short:'Дерево причин',caption:'Связи и источники'},
 {id:10,title:'Итоги расследования',short:'Результаты',caption:'Ваше прохождение и разбор'}
];
