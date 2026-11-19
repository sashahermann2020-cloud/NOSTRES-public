"use client";

import { currentSource } from "../../traffic-source";
import QuickHelp from "../../QuickHelp";
import Link from "../../i18n/link";
import { useEffect, useState } from "react";
import RouteTools from "../../RouteTools";
import ChannelMatrix from "../../ChannelMatrix";
import { buildRouteSummary, uniqueSources } from "../../route-summary";
import { bankQuestions, dogQuestions, telecomQuestions } from "./everyday-plans";
import { wbsQuestions } from "./everyday-plans";
import { alQuestions, basicQuestions, carQuestions, citizenshipQuestions } from "./status-money-plans";
import { careQuestions, disabilityQuestions, landlordQuestions, moveQuestions } from "./life-events-plans";
import { butQuestions, maternityQuestions } from "./family-support-plans";
import { elternzeitQuestions, wohngeldQuestions } from "./life-benefits-plans";
import { elterngeldQuestions, kinderzuschlagQuestions, taxQuestions } from "./family-money-plans";
import { employmentQuestions, jobcenterQuestions, kindergeldQuestions, kitaQuestions } from "./family-work-plans";
import { reunionQuestions } from "./reunion-plans";
import { cultureQuestions, transportQuestions } from "./mobility-culture-plans";
import { sprachkursQuestions, studyQuestions } from "./study-language-plans";
import { dogTrainerQuestions, petMoveQuestions, petPassQuestions, vetQuestions } from "./pets-plans";
import { languageQuestions, recognitionQuestions, workQuestions } from "./work-learning-plans";
import { leaQuestions } from "./lea-guided";
import { companyQuestions } from "./company-plans";
import { socialNumberQuestions } from "./socialnumber-plans";
import { settlementQuestions } from "./settlement-plans";
import { notaryQuestions } from "./notary-plans";
import { mentalQuestions } from "./mental-health-plans";
import { discriminationQuestions, hardshipQuestions, homelessQuestions, violenceQuestions } from "./help-plans";
import { chanceQuestions, relocationQuestions, studyVisaQuestions, volunteerQuestions, workVisaQuestions } from "./relocation-plans";
import { housingQuestions } from "./housing-guided";
import { businessQuestions, doctorQuestions, official, planFor, questionsFor, urgentQuestions, type Answers, type RouteId } from "./route-plans";
import { explainTerms } from "../../term-explanations";
import ExplainedText from "../../ExplainedText";
import { germanRuns } from "../../german-runs";
import HearingAccess from "../../HearingAccess";
import { factKindLabels, fitLabels, methodKindLabels, outcomeHelp, outcomeOptions } from "./route-model";

import { ROUTE_STORAGE_KEY as storageKey, readRouteProgress, readRouteAttempt } from "../../progress-storage";
import { themeOf } from "../../route-themes";
import { tr, useLocale, lh } from "../../i18n/store";
import { ShareAfterRoute } from "../../ShareButton";
import HeaderTools from "../../i18n/HeaderTools";
import { routeCheckedAt } from "../../route-checks";
/** Дата последней проверки по официальным страницам (спецификация TIME-07): единый список в app/route-checks.ts. */
const checkedAtFor = (id: RouteId): string => routeCheckedAt[id];
const config = {
  transport: { title: "Билеты на общественный транспорт Берлина и Deutschlandticket", intro: "Сравните тарифы VBB, Deutschlandticket и отдельные предложения для школьников, студентов, учащихся, получателей пособий и людей с инвалидностью. Выберите зоны, частоту поездок и способ покупки.", className: "transport-page", questions: transportQuestions, completion: "Билет выбран или право на льготу подтверждено" },
  culture: { title: "Льготы на культуру и досуг в Берлине", intro: "Найдите бесплатные музеи и события, билеты для детей и семей, льготы для получателей пособий, студентов, людей с инвалидностью, беженцев и людей с низким доходом. Условия зависят от возраста, документов и площадки.", className: "culture-page", questions: cultureQuestions, completion: "Подходящее предложение найдено" },
  doctor: { title: "Arztsuche (поиск врача и запись)", intro: "Ответьте на вопросы о страховке и нужном приёме. После этого появится подходящий способ поиска, записи и подготовки к визиту.", className: "doctor-page", questions: doctorQuestions, completion: "Запись или контакт с практикой получены" },
  urgent: { title: "Notfall (срочная медицинская помощь)", intro: "Определите следующий официальный контакт по срочности. NOSTRES не ставит диагноз и не принимает экстренные обращения.", className: "urgent-page", questions: urgentQuestions, completion: "Получена помощь или направление" },
  bank: { title: "Girokonto (банковский счёт)", intro: "Узнайте, какой счёт вам подходит, какие документы нужны и что делать, если банк отказал. Данные взяты с официальных страниц BaFin (федерального надзора за банками) и самих банков.", className: "bank-page", questions: bankQuestions, completion: "Счёт открыт или решение по отказу получено" },
  lea: { title: "Aufenthaltstitel (продление вида на жительство)", intro: "Ответьте на вопросы о документе и основании. Маршрут покажет, подходит ли вам онлайн-продление через LEA (Берлинское ведомство по делам иммиграции), документы, порядок и сроки; в других случаях откроет нужную официальную услугу.", className: "lea-guided", questions: leaQuestions, completion: "Новый вид на жительство получен" },
  housing: { title: "Wohnungssuche (поиск квартиры или комнаты)", intro: "Выберите формат жилья и получите способы поиска, документы для заявки, порядок действий и связь с WBS и регистрацией адреса. Факты взяты с официальных страниц Берлина.", className: "housing-guided", questions: housingQuestions, completion: "Договор аренды подписан" },
  wbs: { title: "WBS (разрешение на социальное жильё)", intro: "Узнайте, можете ли вы подать заявление на WBS, какие документы нужны и как его подать: онлайн, почтой или лично. Данные взяты с официальных страниц Берлина.", className: "wbs-page", questions: wbsQuestions, completion: "WBS получен или решение ведомства получено" },
  telecom: { title: "Mobilfunk и Internet (мобильная связь и интернет)", intro: "Что проверить до подписи договора, как сменить провайдера, расторгнуть договор и что делать при проблеме. Основано на правилах Bundesnetzagentur.", className: "telecom-page", questions: telecomQuestions, completion: "Договор оформлен или вопрос с провайдером решён" },
  dog: { title: "Hund (собака: регистрация, налог, опасные породы)", intro: "Регистрация собаки, налог, правила прогулок и особый порядок для Pit Bull Terrier, American Staffordshire Terrier, Bull Terrier и их помесей.", className: "dog-page", questions: dogQuestions, completion: "Регистрация и налоговый учёт подтверждены" },
  kindergeld: { title: "Kindergeld (пособие на ребёнка)", intro: "Узнайте, можете ли вы подать заявление на Kindergeld (детское пособие), как это сделать онлайн, какие документы нужны и что делать, если ответа нет. Данные взяты с официальных страниц Bundesagentur für Arbeit.", questions: kindergeldQuestions, completion: "Заявление подано или решение Familienkasse получено" },
  jobcenter: { title: "Agentur für Arbeit и Jobcenter (потеря работы и пособия)", intro: "Как зарегистрироваться безработным и подать заявление на Arbeitslosengeld (пособие по безработице) или на Grundsicherung в Jobcenter. Данные взяты с официальных страниц Bundesagentur für Arbeit.", questions: jobcenterQuestions, completion: "Регистрация выполнена или заявление подано" },
  kita: { title: "Kita, Schule und Geburt (детский сад, школа, рождение ребёнка)", intro: "Оформите Kita-Gutschein (ваучер на детский сад), запишите ребёнка в школу или сообщите о рождении в Standesamt. Данные взяты с официальных страниц Берлина.", questions: kitaQuestions, completion: "Заявление подано или ребёнок записан" },
  employment: { title: "Stellensuche (поиск работы по найму)", intro: "Можно ли вам работать по найму, где искать вакансии и куда обращаться, если работодатель нарушает условия. Данные взяты с официальных страниц Bundesagentur für Arbeit, Zoll и Берлина.", questions: employmentQuestions, completion: "Выбран следующий шаг и ссылки открыты" },
  elternzeit: { title: "Elternzeit (родительский отпуск)", intro: "Как уведомить работодателя, в какие сроки, на сколько и что с неполным днём, защитой от увольнения и страховкой. Данные взяты с официальных страниц BMBFSFJ, Familienportal и закона BEEG.", questions: elternzeitQuestions, completion: "Работодатель уведомлён и подтвердил отпуск" },
  wohngeld: { title: "Wohngeld (жилищная доплата к аренде или расходам на жильё)", intro: "Проверьте, можно ли вам получить Wohngeld в Берлине, и подайте заявление. Данные взяты с официальных страниц Берлина, закона WoGG и BMWSB.", questions: wohngeldQuestions, completion: "Заявление подано" },
  mutterschutz: { title: "Mutterschutz und Mutterschaftsgeld (защита материнства и пособие по материнству)", intro: "Узнайте, какую защиту и какое пособие вы получаете до и после родов, куда подавать заявление и что доплачивает работодатель. Данные взяты с официальных страниц Familienportal и Bundesamt für Soziale Sicherung.", questions: maternityQuestions, completion: "Заявление подано" },
  bildungspaket: { title: "Bildungs- und Teilhabepaket (помощь на школу и досуг детей)", intro: "Проверьте, положена ли вашему ребёнку помощь на обед, школьные принадлежности, поездки, репетитора и досуг, и как её получить. Данные взяты с официальных страниц Берлина и Bundesagentur für Arbeit.", questions: butQuestions, completion: "berlinpass-BuT получен" },
  pflegegeld: { title: "Pflegegeld und Pflegegrad (пособие по уходу и степень нуждаемости в уходе)", intro: "Узнайте, как получить Pflegegrad, подать заявление в Pflegekasse, подготовиться к осмотру и какие суммы положены. Данные взяты с официальных страниц Bundesgesundheitsministerium, Medizinischer Dienst и Берлина.", questions: careQuestions, completion: "Заявление подано" },
  schwerbehinderung: { title: "Schwerbehindertenausweis (удостоверение тяжёлой инвалидности)", intro: "Подайте заявление в Versorgungsamt, догрузите документы или поймите, что делать после решения с GdB. Данные взяты с официальных страниц LAGeSo и Bundesagentur für Arbeit.", questions: disabilityQuestions, completion: "Заявление подано или решение получено" },
  wohnungsgeber: { title: "Wohnungsgeberbestätigung (подтверждение заселения от арендодателя)", intro: "Что должно быть в подтверждении, в какой срок его выдают и что делать, если арендодатель отказывает. Данные взяты с официальных страниц Берлина и закона о регистрации.", questions: landlordQuestions, completion: "Подтверждение получено или выдано" },
  umzug: { title: "Umzug (переезд и смена адреса)", intro: "Зарегистрируйте новый адрес в течение 14 дней, онлайн или в Bürgeramt, и сообщите о переезде Rundfunkbeitrag и в ведомства. Данные взяты с официальных страниц Берлина и Rundfunkbeitrag.", questions: moveQuestions, completion: "Адрес зарегистрирован" },
  arbeitslosengeld: { title: "Arbeitslosengeld (пособие по безработице)", intro: "Узнайте, есть ли у вас право на Arbeitslosengeld, какой будет размер и срок и как не получить блокировку. Данные взяты с официальной страницы Bundesagentur für Arbeit.", questions: alQuestions, completion: "Регистрация и заявление поданы" },
  grundsicherungsgeld: { title: "Grundsicherungsgeld (бывшее Bürgergeld: основное пособие для нуждающихся)", intro: "Узнайте, из чего складывается Grundsicherungsgeld, какие условия, что учитывается и как подать заявление в Jobcenter. Данные взяты с официальных страниц Bundesagentur für Arbeit и Bundesregierung.", questions: basicQuestions, completion: "Заявление подано" },
  kfz: { title: "Kfz-Ummeldung (перерегистрация автомобиля после переезда)", intro: "Как перерегистрировать автомобиль после переезда в Берлин или внести новый адрес в Zulassungsbescheinigung Teil I. Данные взяты с официальных страниц Берлина.", questions: carQuestions, completion: "Автомобиль перерегистрирован или адрес внесён" },
  einbuergerung: { title: "Einbürgerung (получение гражданства Германии)", intro: "Проверьте условия получения гражданства Германии, подготовьте документы, тест и подайте онлайн-заявление в Landesamt für Einwanderung. Данные взяты с официальных страниц Берлина и Willkommenszentrum Berlin.", questions: citizenshipQuestions, completion: "Заявление подано" },
  workpermit: { title: "Aufenthaltstitel für Beschäftigung (вид на жительство для работы: Blue Card и Fachkräfte)", intro: "Выберите подходящий путь: Blue Card, вид на жительство специалиста или Chancenkarte. Данные взяты с официальных страниц Берлина и Make it in Germany.", questions: workQuestions, completion: "Заявление подано" },
  recognition: { title: "Anerkennung (признание иностранного диплома или профессии)", intro: "Узнайте, какое ведомство рассматривает вашу профессию, и подайте заявление. Данные взяты со страниц Anerkennung in Deutschland и Берлина.", questions: recognitionQuestions, completion: "Заявление подано" },
  reunion: { title: "Familiennachzug (воссоединение семьи)", intro: "Узнайте, как супруг, супруга или ребёнок получают вид на жительство в Берлине: нужна ли виза, какие условия и документы. Данные взяты с официальных страниц Берлина, Make it in Germany и BAMF.", questions: reunionQuestions, completion: "Заявление подано" },
  sprachkurs: { title: "Sprachkurs (языковые курсы)", intro: "Выберите язык, который хотите учить, язык объяснений и способ оплаты. Маршрут покажет городские курсы Берлина, Goethe-Institut и государственные курсы с допуском. Данные взяты с официальных страниц vhs Берлина, BAMF, Arbeitsagentur и Goethe-Institut.", questions: sprachkursQuestions, completion: "Записан на курс" },
  company: { title: "GmbH или UG (компания с ограниченной ответственностью) в Берлине", intro: "Выберите между GmbH и UG, заверьте договор у нотариуса, внесите капитал и пройдите регистрации после записи в Handelsregister: Gewerbe, налоговая анкета, Transparenzregister и ежегодная отчётность. Данные взяты с официальных страниц Берлина, IHK Berlin, ELSTER, BVA, Bundesamt für Justiz и закона GmbHG.", questions: companyQuestions, completion: "Компания зарегистрирована" },
  socialnumber: { title: "Sozialversicherungsnummer и Krankenversichertennummer (номер социального страхования и номер медицинской страховки)", intro: "Узнайте, где взять номер, который просит работодатель, как бесплатно получить Versicherungsnummernachweis и где найти номер медицинской страховки на карте eGK. Данные взяты с официальных страниц Deutsche Rentenversicherung, gesund.bund.de и Федерального министерства здравоохранения.", questions: socialNumberQuestions, completion: "Номер получен" },
  settlement: { title: "Niederlassungserlaubnis (бессрочный вид на жительство) в Берлине", intro: "Узнайте, когда можно подавать на бессрочный вид на жительство: для специалистов, Blue Card, семьи граждан Германии, признанных беженцев и по общим правилам. Маршрут покажет срок, уровень немецкого, документы и порядок подачи в LEA. Данные взяты с официальных страниц услуг LEA Berlin и закона о пребывании.", questions: settlementQuestions, completion: "Niederlassungserlaubnis получен" },
  mental: { title: "Psychische Gesundheit (психическое здоровье): где получить помощь", intro: "Если вам плохо прямо сейчас, выберите первый ответ: помощь покажется сразу, без других вопросов. Сначала маршрут показывает способы без звонка: прийти лично или написать. Данные взяты с официальных страниц 116117, BMG, gesund.bund.de, Берлина, Berliner Krisendienst и Bundesagentur für Arbeit.", questions: mentalQuestions, completion: "Помощь найдена" },
  discrimination: { title: "Diskriminierung (дискриминация): где получить помощь", intro: "Расскажите, где с вами обошлись несправедливо: маршрут покажет бесплатные консультации в Берлине, сроки для требований и куда подать жалобу. Данные взяты с официальных страниц LADS, Antidiskriminierungsstelle des Bundes, Bürger- und Polizeibeauftragter и закона AGG.", questions: discriminationQuestions, completion: "Помощь найдена" },
  homeless: { title: "Wohnungslosigkeit (без жилья или угроза выселения)", intro: "Если негде ночевать сегодня, выберите первый ответ: ночлег покажется сразу. Маршрут ведёт к Soziale Wohnhilfe района, ночлежкам Berliner Kältehilfe и помощи при долге за аренду. Данные взяты с официальных страниц Берлина, Berliner Kältehilfe, Berliner Stadtmission и закона.", questions: homelessQuestions, completion: "Помощь найдена" },
  hardship: { title: "Трудная ситуация: еда, деньги, долги, консультация", intro: "Выберите, что нужно в первую очередь: маршрут покажет пункты выдачи еды, пособия, бесплатные службы по долгам и миграционную консультацию на вашем языке. Данные взяты с официальных страниц Берлина, BAMF, Berliner Tafel, Красного Креста, Caritas и Berliner Stadtmission.", questions: hardshipQuestions, completion: "Помощь найдена" },
  violence: { title: "Häusliche Gewalt (домашнее насилие): где получить защиту", intro: "Если вам угрожает опасность сейчас, выберите первый ответ: помощь покажется сразу. Маршрут показывает BIG Hotline, Frauenhaus, письменные каналы без звонка и бесплатную документацию травм. Данные взяты с официальных страниц Берлина, полиции Берлина, BIG Hotline и Hilfetelefon.", questions: violenceQuestions, completion: "Помощь найдена" },
  notary: { title: "Notar (нотариус) в Берлине: как найти и сколько стоит", intro: "Узнайте, как найти нотариуса в Берлине, почему цена одинакова у всех нотариусов и сколько стоит учреждение GmbH или UG по примерам Bundesnotarkammer. Данные взяты с официальных страниц Notarkammer Berlin, Bundesnotarkammer и закона GNotKG.", questions: notaryQuestions, completion: "Договор заверен" },
  relocation: { title: "Переезд в Германию: какой путь вам подходит", intro: "Ответьте на вопросы о гражданстве и цели. Маршрут покажет, нужна ли виза, какой путь подходит – работа, Chancenkarte, учёба, Ausbildung, волонтёрская служба, семья или Working Holiday – и откроет следующий маршрут. Данные взяты с официальных страниц Auswärtiges Amt, Make it in Germany и Берлина.", questions: relocationQuestions, completion: "Путь выбран" },
  chancenkarte: { title: "Chancenkarte (карта возможностей для поиска работы)", intro: "Посчитайте баллы по официальной таблице, подготовьте средства и документы и подайте заявление на визу ещё в своей стране. Данные взяты с официальных страниц Make it in Germany и Auswärtiges Amt.", questions: chanceQuestions, completion: "Виза получена" },
  workvisa: { title: "Visum zur Erwerbstätigkeit (виза для работы: Blue Card, специалисты, Anerkennungspartnerschaft)", intro: "С предложением работодателя выберите вид визы, подготовьте согласие Bundesagentur für Arbeit и подайте заявление в Auslandsportal до переезда. Данные взяты с официальных страниц Auswärtiges Amt, Make it in Germany, Bundesagentur für Arbeit и Берлина.", questions: workVisaQuestions, completion: "Виза получена" },
  volunteer: { title: "Freiwilligendienst (виза для волонтёров: BFD, FSJ, FÖJ, Европейский корпус солидарности)", intro: "Узнайте, какая служба подходит по возрасту, где найти место и какие документы нужны для визы или разрешения в Берлине. Данные взяты с официальных страниц Bundesfreiwilligendienst, Европейского портала молодёжи, Auswärtiges Amt и Берлина.", questions: volunteerQuestions, completion: "Виза получена" },
  studyvisa: { title: "Visum zum Studium und zur Ausbildung (виза для учёбы, поступления и Ausbildung)", intro: "Выберите цель, посчитайте средства на 2026 год, откройте Sperrkonto и подайте заявление на визу ещё в своей стране. Данные взяты с официальных страниц Make it in Germany, Auswärtiges Amt, Берлина и закона о пребывании.", questions: studyVisaQuestions, completion: "Виза получена" },
  study: { title: "Учёба: университет, Studienkolleg и Ausbildung", intro: "Выберите, куда хотите поступить и на каком языке учиться. Маршрут покажет шаги, документы и каталоги программ. Данные взяты с официальных страниц uni-assist, DAAD, HWR Berlin и Arbeitsagentur.", questions: studyQuestions, completion: "Заявка подана" },
  petmove: { title: "Переезд с животным в Германию", intro: "Выберите животное и страну, откуда въезжаете. Маршрут покажет чип, прививку, тест на антитела, сертификат и пункт ввоза, а затем первые шаги в Берлине. Данные взяты с официальных страниц Европейской комиссии, BMLEH (федерального министерства сельского хозяйства) и таможни.", questions: petMoveQuestions, completion: "Животное въехало, документы проверены" },
  petpass: { title: "EU-Heimtierausweis (паспорт животного ЕС)", intro: "Узнайте, нужен ли вам новый паспорт, что сделать до него и сколько это стоит. Данные взяты с официальных страниц BMLEH и Европейской комиссии.", questions: petPassQuestions, completion: "Паспорт животного получен" },
  vet: { title: "Tierarzt (ветеринар в Берлине)", intro: "Выберите, насколько срочно нужна помощь и на каком языке. Маршрут покажет дежурные клиники по списку ветеринарной палаты Берлина и практики, где язык приёма указан на их сайте.", questions: vetQuestions, completion: "Приём у ветеринара состоялся" },
  dogtrainer: { title: "Hundeschule und Hundeführerschein (дрессировка и экзамен для владельца собаки)", intro: "Как выбрать дрессировщика с разрешением ведомства, где сдать экзамен, чтобы гулять без поводка, и кто проводит Wesenstest. Данные взяты с официальных страниц Сената Берлина и из закона о защите животных.", questions: dogTrainerQuestions, completion: "Экзамен сдан или дрессировщик выбран" },
  language: { title: "Integrationskurs (интеграционный и языковой курс)", intro: "Получите допуск, запишитесь на курс и узнайте, сколько он стоит. Данные взяты с официальных страниц BAMF и BMI.", questions: languageQuestions, completion: "Записан на курс" },
  elterngeld: { title: "Elterngeld (пособие родителям после рождения ребёнка)", intro: "Узнайте, можете ли вы получить Elterngeld, какие документы нужны, куда подавать заявление и как изменить уже поданное. Данные взяты с официальных страниц Берлина и Familienportal.", questions: elterngeldQuestions, completion: "Заявление отправлено или готовность подтверждена" },
  kinderzuschlag: { title: "Kinderzuschlag (доплата к Kindergeld для семей с небольшим доходом)", intro: "Проверьте, подходит ли вам Kinderzuschlag, и подайте заявление в Familienkasse. Данные взяты с официальных страниц Bundesagentur für Arbeit.", questions: kinderzuschlagQuestions, completion: "Заявление подано" },
  steuererklaerung: { title: "Einkommensteuererklärung (налоговая декларация)", intro: "Нужно ли вам подавать декларацию, к какому сроку и как: онлайн в ELSTER, на бумаге или через консультанта. Данные взяты с официальных страниц Берлина.", questions: taxQuestions, completion: "Декларация подана или передана консультанту" },
  business: { title: "Gewerbe или Freiberuf (своё дело или фриланс)", intro: "Проверьте право на деятельность, вид работы и способ регистрации в Берлине. После ответов откроется ваш порядок действий.", className: "business-page", questions: businessQuestions, completion: "Регистрация и налоговый номер получены" },
} as const;

type Saved = { answers?: Answers; doneSteps?: number[]; outcome?: string; method?: string; updatedAt?: string };

function savedRoute(id: RouteId): Saved {
  try {
    const routes = JSON.parse(readRouteProgress() || "{}") as Record<string, Saved>;
    return routes[id] || {};
  } catch { return {}; }
}
function saveRoute(id: RouteId, route: Saved) {
  try {
    const routes = JSON.parse(readRouteProgress() || "{}") as Record<string, Saved>;
    window.localStorage.setItem(storageKey, JSON.stringify({ ...routes, [id]: { ...route, updatedAt: new Date().toISOString() } }));
  } catch { /* Route remains usable when local storage is unavailable. */ }
}
function attemptId(id: RouteId) {
  try {
    const key = `nostres-attempt-${id}`;
    let value = readRouteAttempt(id);
    if (!value) { value = crypto.randomUUID(); window.sessionStorage.setItem(key, value); }
    return value;
  } catch { return "anonymous-session"; }
}
// В этих маршрутах название способа выдаёт чувствительную категорию (пособие, инвалидность, статус беженца),
// поэтому в статистику уходит только тип способа: онлайн, лично, почтой или смешанный (решение владельца от 30.10.2026).
const GENERIC_METHOD_ROUTES = new Set<RouteId>(["transport", "culture"]);

async function record(id: RouteId, payload: Record<string, unknown>) {
  try { await fetch("/api/mvp-events", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ routeId: id, attemptId: attemptId(id), ...payload }) }); } catch { /* Analytics never blocks the route. */ }
}

function CheckIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-9" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>;
}

export default function GuidedRoute({ id }: { id: RouteId }) {
  useLocale();
  const cfg = config[id];
  const [answers, setAnswers] = useState<Answers>({});
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [outcome, setOutcome] = useState("");
  const [methodId, setMethodId] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [clarity, setClarity] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [officialAction, setOfficialAction] = useState("");
  const [blocker, setBlocker] = useState("none");
  const [feedbackState, setFeedbackState] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = savedRoute(id);
      setAnswers(saved.answers || {});
      setDoneSteps(saved.doneSteps || []);
      setOutcome(saved.outcome || "");
      setMethodId(saved.method || "");
      record(id, { kind: "event", eventName: "situation_opened", elementId: currentSource() });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [id]);

  const questions = questionsFor(id, answers);
  const complete = questions.every((question) => Boolean(answers[question.id]));
  const plan = revealed && complete ? planFor(id, answers) : null;
  const allKeys = cfg.questions.map((question) => question.id);

  function answer(key: string, value: string) {
    const next = { ...answers, [key]: value };
    allKeys.slice(allKeys.indexOf(key) + 1).forEach((later) => delete next[later]);
    setAnswers(next); setRevealed(false); setDoneSteps([]); setOutcome(""); setMethodId("");
    saveRoute(id, { answers: next, doneSteps: [], outcome: "", method: "" });
    record(id, { kind: "event", eventName: "question_answered", elementId: key });
  }
  function showResult() {
    if (!complete) return;
    setRevealed(true);
    record(id, { kind: "event", eventName: "route_result_generated" });
    window.setTimeout(() => { const result = document.getElementById("new-route-result"); result?.focus(); result?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); }, 40);
  }
  function toggleStep(index: number) {
    const next = doneSteps.includes(index) ? doneSteps.filter((n) => n !== index) : [...doneSteps, index];
    setDoneSteps(next);
    saveRoute(id, { answers, doneSteps: next, outcome, method: methodId });
    record(id, { kind: "event", eventName: doneSteps.includes(index) ? "step_reopened" : "step_completed", stepIndex: index });
  }
  function updateOutcome(value: string) {
    setOutcome(value);
    saveRoute(id, { answers, doneSteps, outcome: value, method: methodId });
    record(id, { kind: "event", eventName: outcomeOptions.find((option) => option.value === value)?.event ?? "step_blocked" });
  }
  function chooseMethod(value: string) {
    setMethodId(value); setDoneSteps([]); setOutcome("");
    saveRoute(id, { answers, doneSteps: [], outcome: "", method: value });
    const kind = methods.find((method) => method.id === value)?.kind ?? "other";
    record(id, { kind: "event", eventName: "action_method_selected", elementId: GENERIC_METHOD_ROUTES.has(id) ? `kind:${kind}` : value });
    window.setTimeout(() => document.getElementById("new-route-steps")?.focus(), 40);
  }
  async function submitFeedback() {
    setFeedbackState("sending");
    try {
      const response = await fetch("/api/mvp-events", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: "feedback", routeId: id, attemptId: attemptId(id), clarityRating: Number(clarity), nextActionStatus: nextAction, officialActionStatus: officialAction, blockerCode: blocker, outcome: outcome || null }) });
      setFeedbackState(response.ok ? "sent" : "error");
    } catch { setFeedbackState("error"); }
  }

  const methods = plan?.methods ?? [];
  const selectedMethod = methods.find((method) => method.id === methodId) ?? (methods.length === 1 ? methods[0] : undefined);
  const shownSteps = plan ? (methods.length ? selectedMethod?.steps ?? [] : plan.steps) : [];
  const sourceList = [...new Map(shownSteps.flatMap((step) => [step.source, step.action, step.alternative].filter((value): value is NonNullable<typeof value> => Boolean(value))).filter((item) => item.href.startsWith("http")).map((item) => [item.href, item])).values()];
  const whyLines = plan ? (plan.why?.length ? plan.why : questions.map((question) => { const label = question.options.find(([value]) => value === answers[question.id])?.[1]; return label ? `${germanRuns(tr(question.prompt))} ${germanRuns(tr(label))}` : ""; }).filter(Boolean)) : [];
  const summarySteps = plan ? shownSteps.map((step, index) => ({ title: explainTerms(step.title), detail: explainTerms(step.detail), mode: step.mode, done: doneSteps.includes(index), links: [step.action, step.alternative, step.source].filter((link): link is NonNullable<typeof link> => Boolean(link)) })) : [];
  const summaryText = plan ? buildRouteSummary({ routeTitle: cfg.title, resultTitle: explainTerms(plan.title), resultSummary: selectedMethod ? `${germanRuns(tr(plan.summary))} ${germanRuns(tr("Способ:"))} ${germanRuns(tr(selectedMethod.title))}.` : plan.summary, note: plan.note, steps: summarySteps, checkedAt: checkedAtFor(id) }) : "";

  return <main className={"className" in cfg ? `route-page ${cfg.className}` : "route-page"} id="top" tabIndex={-1}>
    <header className="site-header route-page-header"><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true" data-mark="N" /><span className="brand-copy"><b>NOSTRES</b><small>{germanRuns(tr("Понятный путь"))}</small></span></Link><Link className="plan-return" href="/berlin/start">{germanRuns(tr("Мой план"))}</Link><div className="header-actions"><Link className="back-link" href="/mvp-test">{germanRuns(tr("Все тестовые маршруты"))}</Link><HeaderTools /></div></header>
    <section className="route-hero"><div className="route-breadcrumb"><Link href="/">NOSTRES</Link><span>›</span><Link href="/mvp-test">{germanRuns(tr("Маршруты"))}</Link><span>›</span><span>{germanRuns(tr(themeOf(id)))}</span></div><h1><ExplainedText text={cfg.title} /></h1><p className="route-hero-lede">{germanRuns(tr(cfg.intro))}</p>{id === "vet" && <p className="urgent-alert">{germanRuns(tr("Если животному угрожает смерть, не ждите окончания анкеты. Сразу свяжитесь с ветеринарной клиникой экстренной помощи."))} <a href="https://tieraerztekammer-berlin.de/notdienst/" target="_blank" rel="noopener noreferrer">{germanRuns(tr("Дежурная ветеринарная помощь в Берлине"))}</a>.</p>}{id === "urgent" && <p className="urgent-alert">{germanRuns(tr("При непосредственной угрозе жизни звоните"))} <a href="tel:112">112</a>{germanRuns(tr(". Не ждите ответа на сайте."))}</p>}</section>
    <div className="route-layout questionnaire-active"><div className="route-main">
      {!revealed && <section className="route-section" aria-labelledby="new-questions"><div className="route-section-heading"><div><p className="overline">{germanRuns(tr("Шаг 1 · ситуация"))}</p><h2 id="new-questions">{germanRuns(tr("Ответьте на вопросы"))}</h2></div><span>{questions.filter((q) => answers[q.id]).length}/{questions.length}</span></div><p className="questionnaire-intro">{germanRuns(tr("Здесь только вопросы. После ответов нажмите «Получить маршрут»: откроются вывод и ссылки на официальные действия."))}</p>
        {questions.map((question, index) => <fieldset className="route-question route-page-question" key={question.id}><legend><span>{index + 1}</span><ExplainedText text={question.prompt} /></legend><div className="option-grid">{question.options.map(([value, label]) => <label className={answers[question.id] === value ? "selected" : ""} key={value}><input type="radio" name={question.id} value={value} checked={answers[question.id] === value} onChange={() => answer(question.id, value)} /><span>{germanRuns(explainTerms(label))}</span></label>)}</div></fieldset>)}
        <div className="questionnaire-submit"><button className="primary-action questionnaire-result-button" type="button" disabled={!complete} onClick={showResult}>{germanRuns(tr("Получить маршрут →"))}</button><small>{germanRuns(tr("Ответы останутся только на этом устройстве. Личные документы и сведения о здоровье не запрашиваются."))}</small></div>
      </section>}
      {plan && <div id="new-route-result" tabIndex={-1} aria-label={tr("Ваш персональный маршрут")}><section className="route-result">{plan.fit && id !== "urgent" && <span className={`result-kicker fit-${plan.fit}`}>{germanRuns(tr(fitLabels[plan.fit]))}</span>}<p className="overline">{germanRuns(tr("Ваш ответ"))}</p><h2><ExplainedText text={plan.title} /></h2><p>{germanRuns(explainTerms(plan.summary))}</p>{plan.note && <p className="new-route-note">{germanRuns(explainTerms(plan.note))}</p>}
          {whyLines.length > 0 && <details className="result-evidence"><summary>{germanRuns(tr("Почему такой результат?"))}</summary><ul>{whyLines.map((line) => <li key={line}>{germanRuns(explainTerms(line))}</li>)}</ul><p>{germanRuns(tr("Результат собран по вашим ответам и официальным страницам, указанным в шагах."))}</p></details>}
          <button className="lea-edit" type="button" onClick={() => { setRevealed(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{germanRuns(tr("Изменить ответы"))}</button></section>
        {methods.length > 0 && <section className="route-section method-section" aria-labelledby="new-methods"><div className="route-section-heading"><div><p className="overline">{germanRuns(tr("Шаг 2 · способ"))}</p><h2 id="new-methods">{methods.length > 1 ? tr("Выберите способ") : tr("Ваш способ")}</h2></div><span>{methods.length}</span></div>
          <div className="method-grid route-method-grid">{methods.map((method) => <button className={selectedMethod?.id === method.id ? "method-card selected" : "method-card"} type="button" key={method.id} aria-pressed={selectedMethod?.id === method.id} onClick={() => chooseMethod(method.id)}><span className="method-card-top"><b>{germanRuns(tr(methodKindLabels[method.kind]))}</b></span><strong><ExplainedText text={method.title} /></strong><p>{germanRuns(explainTerms(method.summary))}</p><span className={`availability ${method.availability}`}>{germanRuns(explainTerms(method.availabilityLabel))}</span><span className="method-cta">{selectedMethod?.id === method.id ? tr("Выбрано") : tr("Открыть этот путь")}</span></button>)}</div>
          {methods.length === 1 && plan.singleMethodNote && <p className="method-note">{germanRuns(explainTerms(plan.singleMethodNote))}</p>}
          {methods.length > 1 && !selectedMethod && <p className="method-note">{germanRuns(tr("Выберите способ, чтобы увидеть условия, документы и шаги именно для него. Выбор можно изменить: шаги пересчитаются."))}</p>}
        </section>}
        {selectedMethod && <details className="route-section preparation-details" open><summary>{germanRuns(tr("Что подготовить до начала"))}</summary><div className="split-section-inner"><div><h3>{germanRuns(tr("Условия"))}</h3><ul className="requirement-list">{selectedMethod.conditions.map((item) => <li key={item}><CheckIcon /><span>{germanRuns(explainTerms(item))}</span></li>)}</ul></div><div><h3>{germanRuns(tr("Документы и данные"))}</h3><ul className="document-list">{selectedMethod.documents.map((item) => <li key={item}>{germanRuns(explainTerms(item))}</li>)}</ul></div></div></details>}
        {selectedMethod?.providers && selectedMethod.providers.length > 0 && <section className="route-section provider-choice" aria-labelledby="new-providers"><div className="route-section-heading"><div><p className="overline">{germanRuns(tr("Готовые варианты"))}</p><h2 id="new-providers">{selectedMethod.providersTitle ? tr(selectedMethod.providersTitle) : tr("Выберите вариант")}</h2></div><span>{selectedMethod.providers.length}</span></div>{selectedMethod.providersNote && <p className="provider-intro">{germanRuns(explainTerms(selectedMethod.providersNote))}</p>}
          <div className="provider-grid">{selectedMethod.providers.map((provider) => <article className="provider-card" key={provider.id}><div><span>{provider.label ? tr(provider.label) : tr("Официальные данные")}</span><h3>{germanRuns(tr(provider.name))}</h3><p>{germanRuns(explainTerms(provider.summary))}</p>{provider.conditions && <ul className="requirement-list">{provider.conditions.map((item) => <li key={item}><CheckIcon /><span>{germanRuns(explainTerms(item))}</span></li>)}</ul>}{provider.facts.map((fact) => <p className="provider-fact" key={fact.label}><b>{germanRuns(explainTerms(fact.label))}.</b> {germanRuns(explainTerms(fact.value))} <em>{germanRuns(tr(factKindLabels[fact.kind]))}</em></p>)}</div><div className="provider-links">{provider.links.map((link, index) => <a className={index === 0 ? "provider-link primary" : "provider-link"} key={link.href} href={lh(link.href)} target="_blank" rel="noreferrer" onClick={() => record(id, { kind: "event", eventName: "official_source_opened", elementId: provider.id })}>{germanRuns(tr(link.label))} ↗</a>)}</div></article>)}</div>
        </section>}
        {(methods.length === 0 || selectedMethod) && <section className="route-section route-steps-section" id="new-route-steps" tabIndex={-1} aria-labelledby="new-steps"><div className="route-section-heading"><div><p className="overline">{germanRuns(tr("Шаг"))} {methods.length ? "3" : "2"}</p><h2 id="new-steps">{germanRuns(tr("Выполните этапы"))}</h2></div><span>{doneSteps.length}/{shownSteps.length}</span></div><ol className="route-step-list">{shownSteps.map((step, index) => <li className={doneSteps.includes(index) ? "done" : ""} key={`${step.title}-${index}`}><button type="button" aria-pressed={doneSteps.includes(index)} aria-label={`${doneSteps.includes(index) ? tr("Отменить выполнение") : tr("Отметить выполненным")}: ${germanRuns(tr(step.title))}`} onClick={() => toggleStep(index)}>{doneSteps.includes(index) ? <CheckIcon /> : index + 1}</button><div><span className="step-mode">{germanRuns(tr(step.mode))}</span><h3><ExplainedText text={step.title} /></h3><p>{germanRuns(explainTerms(step.detail))}</p><div className="step-actions"><a className="primary-action" href={lh(step.action.href)} target={step.action.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" onClick={() => record(id, { kind: "event", eventName: "official_source_opened", stepIndex: index })}>{germanRuns(tr(step.action.label))}{step.action.href.startsWith("http") ? " ↗" : ""}</a>{step.alternative && <a className="official-secondary" href={lh(step.alternative.href)} target={step.alternative.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{germanRuns(tr(step.alternative.label))}</a>}</div><a className="step-source" href={lh(step.source.href)} target="_blank" rel="noreferrer">{germanRuns(tr("Официальный источник:"))} {germanRuns(tr(step.source.label))} ↗</a></div></li>)}</ol><small className="local-save-note">{germanRuns(tr("Выполненные этапы сохраняются только в браузере этого устройства."))}</small><QuickHelp onVote={(eventName) => void record(id, { kind: "event", eventName })} /></section>}
        {selectedMethod && <section className="method-detail route-method-detail" id="new-method-detail" tabIndex={-1} aria-label={`${germanRuns(tr("Выбранный способ:"))} ${germanRuns(tr(selectedMethod.title))}`}><div className="method-detail-heading"><span>{germanRuns(tr(methodKindLabels[selectedMethod.kind]))}</span><h2><ExplainedText text={selectedMethod.title} /></h2><p>{germanRuns(explainTerms(selectedMethod.summary))}</p></div>
          {selectedMethod.facts && selectedMethod.facts.length > 0 && <div className="timeline-grid verified-facts">{selectedMethod.facts.map((fact) => <div key={fact.label}><small>{germanRuns(explainTerms(fact.label))}</small><b>{germanRuns(explainTerms(fact.value))}</b><span className="fact-kind">{germanRuns(tr(factKindLabels[fact.kind]))}</span></div>)}</div>}
        </section>}
        {(methods.length === 0 || selectedMethod) && <section className="route-section expected-result"><div className="route-section-heading"><div><p className="overline">{germanRuns(tr("Шаг"))} {methods.length ? "4" : "3"}</p><h2>{germanRuns(tr("Подтвердите результат"))}</h2></div></div><p className="result-optional-note">{germanRuns(tr("Этот шаг нужен, если вы уже действуете на официальном сайте. Если проходите тест, пропустите его и перейдите к оценке маршрута ниже."))}</p><div className="outcome-picker outcome-picker-five" role="group" aria-label={tr("Статус результата")}>{outcomeOptions.map((option) => <button className={outcome === option.value ? "selected" : ""} type="button" aria-pressed={outcome === option.value} key={option.value} onClick={() => updateOutcome(option.value)}>{option.value === "received" ? tr(cfg.completion) : tr(option.label)}</button>)}</div>{outcome === "received" && <><div className="goal-state success"><CheckIcon /><div><b>{germanRuns(tr("Цель достигнута"))}</b>{plan.next && <p>{germanRuns(tr("Следующий шаг:"))} <Link href={plan.next.href}>{plan.next.label}</Link></p>}</div></div><ShareAfterRoute /></>}{outcome && outcome !== "received" && <div className="fallback-box route-fallback"><p>{germanRuns(tr(outcomeHelp[outcome]))}</p></div>}</section>}
        {(methods.length === 0 || selectedMethod) && <HearingAccess routeId={id} />}
        {(methods.length === 0 || selectedMethod) && <details className="route-section route-sources" id="official-sources"><summary>{tr("Какие официальные страницы использованы · проверено")} {tr(checkedAtFor(id))} <span>{sourceList.length}</span></summary><div className="route-source-list">{sourceList.map((source, index) => <div className="route-source-row" key={source.href}><a href={lh(source.href)} target="_blank" rel="noreferrer"><span className="source-number">{String(index + 1).padStart(2, "0")}</span><span><b>{germanRuns(explainTerms(source.label))}</b></span><span aria-hidden="true">↗</span></a></div>)}</div></details>}
        <ChannelMatrix id={id === "wbs" ? "housing-wbs" : id} />
        {id === "dog" && answers.breed === "yes" && <ChannelMatrix id="dog-listed" />}
        <RouteTools routeId={id} routeSlug={id} getAttemptId={() => attemptId(id)} summaryText={summaryText} sources={uniqueSources(summarySteps)} onEvent={(eventName) => record(id, { kind: "event", eventName })} />
        <details className="route-section route-evaluation" id="route-evaluation" open><summary>{germanRuns(tr("Оценить понятность маршрута · 1 минута"))}</summary><p className="evaluation-intro">{germanRuns(tr("Оценка анонимна. Ответы на вопросы маршрута и персональные данные в неё не передаются."))}</p><fieldset className="evaluation-field"><legend>{germanRuns(tr("Насколько понятным был маршрут?"))}</legend><div className="rating-buttons" role="group" aria-label={tr("Оценка понятности от 1 до 5")}>{[1, 2, 3, 4, 5].map((n) => <button className={clarity === String(n) ? "selected" : ""} type="button" key={n} aria-label={`${n} ${germanRuns(tr("из 5"))}`} onClick={() => setClarity(String(n))}>{n}</button>)}</div><div className="rating-caption"><span>{germanRuns(tr("Непонятно"))}</span><span>{germanRuns(tr("Полностью понятно"))}</span></div></fieldset><fieldset className="evaluation-field"><legend>{germanRuns(tr("После NOSTRES понятно, что делать дальше?"))}</legend><div className="evaluation-options">{[["yes", "Да"], ["partly", "Частично"], ["no", "Нет"]].map(([value, label]) => <button className={nextAction === value ? "selected" : ""} type="button" key={value} onClick={() => setNextAction(value)}>{germanRuns(tr(label))}</button>)}</div></fieldset><fieldset className="evaluation-field"><legend>{germanRuns(tr("Удалось перейти к нужному официальному действию?"))}</legend><div className="evaluation-options">{[["reached", "Да, перешёл"], ["not_yet", "Ещё не пробовал"], ["blocked", "Нет, возникла проблема"]].map(([value, label]) => <button className={officialAction === value ? "selected" : ""} type="button" key={value} onClick={() => setOfficialAction(value)}>{germanRuns(tr(label))}</button>)}</div></fieldset><label className="evaluation-select"><span>{germanRuns(tr("Что сильнее всего мешало?"))}</span><select value={blocker} onChange={(event) => setBlocker(event.target.value)}><option value="none">{tr("Ничего")}</option><option value="not_my_case">{tr("Нет моего случая")}</option><option value="official_page_unclear">{tr("Непонятна официальная страница")}</option><option value="missing_document">{tr("Не хватает документа")}</option><option value="no_appointment">{tr("Нет свободной записи")}</option><option value="service_error">{tr("Ошибка сайта")}</option><option value="other">{tr("Другое")}</option></select></label><button className="primary-action" type="button" disabled={!clarity || !nextAction || !officialAction || feedbackState === "sending" || feedbackState === "sent"} onClick={submitFeedback}>{feedbackState === "sending" ? tr("Сохраняем…") : feedbackState === "sent" ? tr("Спасибо, оценка сохранена") : tr("Отправить анонимную оценку")}</button>{feedbackState === "error" && <p className="feedback-error">{germanRuns(tr("Оценка сейчас не сохранилась. Попробуйте ещё раз."))}</p>}{feedbackState === "sent" && <p className="feedback-success">{germanRuns(tr("Готово. В оценку не вошли персональные данные."))}</p>}</details>
      </div>}
      <p className="route-disclaimer">{germanRuns(tr("Информация помогает найти официальный порядок действий. При медицинской угрозе жизни звоните 112. Данные проверены по указанным официальным страницам; условия указаны на этих страницах."))}</p>
      {id === "doctor" && <p className="route-disclaimer"><a href={lh(official.doctorInfo)} target="_blank" rel="noreferrer">{germanRuns(tr("Федеральные правила поиска и записи к врачу ↗"))}</a></p>}
    </div></div>
  </main>;
}
