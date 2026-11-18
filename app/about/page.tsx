import type { Metadata } from "next";
import Link from "../i18n/link";
import { InfoPage } from "../info-page";

export const metadata: Metadata = {
  title: "Зачем нужен NOSTRES: сервис после переезда",
  description: "Бесплатные пошаговые маршруты NOSTRES по Берлину: документы, жильё, здоровье, работа, семья, пособия, транспорт и животные.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "NOSTRES: понятный путь после переезда",
    description: "Бесплатный сервис NOSTRES ведёт шаг за шагом после переезда: документы, жильё, здоровье, работа, семья, пособия и транспорт. Первый город: Берлин.",
    url: "https://nostres.world/about",
    locale: "ru_RU",
    siteName: "NOSTRES",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "NOSTRES: понятный путь по важным делам после переезда" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NOSTRES: понятный путь после переезда",
    description: "Готовые маршруты NOSTRES сейчас посвящены Берлину; проект задуман для расширения на другие города и страны.",
  },
};

export default function AboutPage() {
  return <InfoPage title="Зачем нужен NOSTRES">
    <p><strong>NOSTRES</strong> помогает тем, кто переезжает в Германию или уже переехал. Сервис показывает, какие дела нужно сделать, в каком порядке и где оформить их официально. Он независимый и полностью бесплатный.</p>
    <p>Интерфейс доступен на девяти языках, а официальные страницы остаются на немецком.</p>

    <h2>Бесплатно и без регистрации</h2>
    <p>Все маршруты и личный план действий бесплатны. Платить не нужно, аккаунт создавать тоже не нужно.</p>
    <p>NOSTRES не направляет к платным посредникам. В маршрутах только официальные источники: если вывод нельзя подтвердить официальной страницей, NOSTRES его не публикует.</p>

    <h2>Зачем нужен сервис</h2>
    <p>После переезда нужно решить много дел сразу: регистрацию и документы, жильё, медицинскую страховку, работу, банковские услуги, мобильную связь и другие бытовые вопросы. Их порядок зависит от страны, города и вашей ситуации. NOSTRES помогает сначала увидеть, какие дела относятся именно к вам, а затем пройти их по очереди.</p>

    <h2>Как это работает</h2>
    <ol>
      <li><Link href="/berlin/start">Стартовый план</Link>: ответьте, где вы находитесь и что уже оформлено.</li>
      <li>Порядок действий: сервис покажет, что сделать сейчас, а что только после другого шага.</li>
      <li><Link href="/">Маршрут</Link>: откройте нужный, чтобы увидеть условия, документы, шаги и официальные ссылки.</li>
      <li>Прогресс: отмечайте выполненное и возвращайтесь к плану позже. Список можно распечатать.</li>
    </ol>

    <h2>Если трудно звонить или приходить лично</h2>
    <p>Личные визиты, звонки и сложные тексты бывают барьером: из-за языка, ограниченной мобильности, социальной тревожности, нарушений зрения или слуха и других причин. В стартовом плане можно выбрать онлайн или письменное общение без звонков и отметить, что визит сложен или невозможен. Объяснять причину и называть диагноз не нужно.</p>
    <p>Для каждой процедуры NOSTRES показывает только способы, подтверждённые официальными условиями: онлайн, почтой, через представителя или лично. Если дистанционного пути нет, план пишет об этом и ведёт на официальную страницу следующего шага. Ведомство при этом может потребовать личный приём.</p>

    <h2>Какие маршруты есть сейчас</h2>
    <p>Сейчас доступны пятьдесят три маршрута по Берлину и по переезду в Германию, сгруппированные по темам.</p>
    <h3>Переезд в Германию</h3>
    <ul>
      <li><Link href="/berlin/pereezd-v-germaniyu">переезд в Германию: какой путь вам подходит</Link></li>
      <li><Link href="/berlin/chancenkarte">Chancenkarte: карта возможностей для поиска работы</Link></li>
      <li><Link href="/berlin/viza-rabota">виза для работы: Blue Card, специалисты, Anerkennungspartnerschaft</Link></li>
      <li><Link href="/berlin/viza-uchyoba">виза для учёбы, поступления и Ausbildung</Link></li>
      <li><Link href="/berlin/viza-volontyor">виза для волонтёров: BFD, FSJ, FÖJ, Европейский корпус солидарности</Link></li>
      <li><Link href="/berlin/familiennachzug">Familiennachzug: воссоединение семьи</Link></li>
      <li><Link href="/berlin/pereezd-s-zhivotnym">Переезд с животным в Германию</Link></li>
    </ul>
    <h3>Документы и статус</h3>
    <ul>
      <li><Link href="/berlin/anmeldung">регистрация адреса (Anmeldung)</Link></li>
      <li><Link href="/berlin/aufenthalt">подача или продление документа о проживании</Link></li>
      <li><Link href="/berlin/aufenthalt-rabota">Aufenthaltstitel für Beschäftigung: вид на жительство для работы (Blue Card и Fachkräfte)</Link></li>
      <li><Link href="/berlin/niederlassungserlaubnis">Niederlassungserlaubnis: бессрочный вид на жительство</Link></li>
      <li><Link href="/berlin/einbuergerung">Einbürgerung: получение гражданства Германии</Link></li>
    </ul>
    <h3>Жильё</h3>
    <ul>
      <li><Link href="/berlin/wohnungssuche">поиск жилья</Link></li>
      <li><Link href="/berlin/wohnungsgeber">Wohnungsgeberbestätigung: подтверждение заселения от арендодателя</Link></li>
      <li><Link href="/berlin/umzug">Umzug: переезд и смена адреса</Link></li>
      <li><Link href="/berlin/wbs">разрешение на социальное жильё (WBS)</Link></li>
    </ul>
    <h3>Здоровье</h3>
    <ul>
      <li><Link href="/berlin/health-insurance">медицинская страховка</Link></li>
      <li><Link href="/berlin/vrach">поиск врача и запись</Link></li>
      <li><Link href="/berlin/srochnaya-pomoshch">срочная медицинская помощь</Link></li>
      <li><Link href="/berlin/schwerbehinderung">Schwerbehindertenausweis: удостоверение тяжёлой инвалидности</Link></li>
    </ul>
    <h3>Семья и дети</h3>
    <ul>
      <li><Link href="/berlin/kita-schule">Kita, Schule und Geburt: детский сад, школа, рождение ребёнка</Link></li>
      <li><Link href="/berlin/elternzeit">Elternzeit: родительский отпуск</Link></li>
      <li><Link href="/berlin/mutterschutz">Mutterschutz и Mutterschaftsgeld: защита и пособие по материнству</Link></li>
    </ul>
    <h3>Работа и бизнес</h3>
    <ul>
      <li><Link href="/berlin/rabota-po-najmu">Stellensuche: поиск работы по найму</Link></li>
      <li><Link href="/berlin/samostoyatelnaya-rabota">Gewerbe или Freiberuf: своё дело или фриланс</Link></li>
      <li><Link href="/berlin/gmbh-ug">GmbH или UG: компания с ограниченной ответственностью</Link></li>
      <li><Link href="/berlin/anerkennung">Anerkennung: признание иностранного диплома или профессии</Link></li>
      <li><Link href="/berlin/jobcenter">Agentur für Arbeit и Jobcenter: потеря работы и пособия</Link></li>
      <li><Link href="/berlin/sozialversicherungsnummer">номер социального страхования и номер медицинской страховки</Link></li>
      <li><Link href="/berlin/psihicheskoe-zdorovye">психическое здоровье: кризисная помощь, психиатр и психотерапия</Link></li>
      <li><Link href="/berlin/notar">нотариус в Берлине: поиск и стоимость</Link></li>
    </ul>
    <h3>Пособия и льготы</h3>
    <ul>
      <li><Link href="/berlin/kindergeld">Kindergeld (пособие на ребёнка)</Link></li>
      <li><Link href="/berlin/kinderzuschlag">Kinderzuschlag: доплата к Kindergeld</Link></li>
      <li><Link href="/berlin/elterngeld">Elterngeld: пособие родителям после рождения ребёнка</Link></li>
      <li><Link href="/berlin/bildungspaket">Bildungs- und Teilhabepaket: помощь на школу и досуг детей</Link></li>
      <li><Link href="/berlin/wohngeld">Wohngeld: жилищная доплата</Link></li>
      <li><Link href="/berlin/arbeitslosengeld">Arbeitslosengeld: пособие по безработице</Link></li>
      <li><Link href="/berlin/grundsicherungsgeld">Grundsicherungsgeld: бывшее Bürgergeld: основное пособие для нуждающихся</Link></li>
      <li><Link href="/berlin/pflegegeld">Pflegegeld und Pflegegrad: пособие по уходу и степень нуждаемости в уходе</Link></li>
    </ul>
    <h3>Налоги</h3>
    <ul>
      <li><Link href="/berlin/steuer-id">налоговый номер (Steuer-ID)</Link></li>
      <li><Link href="/berlin/steuererklaerung">Einkommensteuererklärung: налоговая декларация</Link></li>
    </ul>
    <h3>Банк и связь</h3>
    <ul>
      <li><Link href="/berlin/bank">банковский счёт</Link></li>
      <li><Link href="/berlin/svyaz">мобильная связь и интернет</Link></li>
    </ul>
    <h3>Транспорт и досуг</h3>
    <ul>
      <li><Link href="/berlin/transport-tickets">билеты на транспорт Берлина и Deutschlandticket</Link></li>
      <li><Link href="/berlin/culture-discounts">бесплатные музеи, события и льготы на культуру и досуг</Link></li>
      <li><Link href="/berlin/kfz-ummeldung">Kfz-Ummeldung: перерегистрация автомобиля после переезда</Link></li>
    </ul>
    <h3>Учёба и язык</h3>
    <ul>
      <li><Link href="/berlin/integrationskurs">Integrationskurs: интеграционный и языковой курс</Link></li>
      <li><Link href="/berlin/sprachkurs">Sprachkurs: языковые курсы</Link></li>
      <li><Link href="/berlin/studium-ausbildung">Учёба: университет, Studienkolleg и Ausbildung</Link></li>
    </ul>
    <h3>Животные</h3>
    <ul>
      <li><Link href="/berlin/sobaka/marshrut">собака: регистрация, налог, опасные породы</Link></li>
      <li><Link href="/berlin/heimtierausweis">EU-Heimtierausweis: паспорт животного ЕС</Link></li>
      <li><Link href="/berlin/veterinar">Tierarzt: ветеринар в Берлине</Link></li>
      <li><Link href="/berlin/dressirovka">Hundeschule и Hundeführerschein: дрессировка и экзамен владельца собаки</Link></li>
    </ul>
    <p>Отдельные практические страницы: <Link href="/berlin/familie-deti">семья и дети</Link> и <Link href="/berlin/obyazatelnye-strahovki">обязательные виды страхования</Link>. В каждом маршруте указаны официальные источники и дата их проверки, а шаги объясняют, куда перейти и какой результат ожидать.</p>
    <p>Маршруты по другим городам пока не опубликованы. NOSTRES задуман для развития в других городах и странах, но новые инструкции появятся только после проверки местных правил.</p>

    <h2>Данные и границы сервиса</h2>
    <p>Аккаунт не нужен. Ответы стартового плана и отметки маршрутов сохраняются в браузере на вашем устройстве; сервис не отправляет ответы на сервер. NOSTRES не является государственным сайтом, не подаёт заявления за пользователя и не заменяет индивидуальную юридическую, медицинскую или налоговую консультацию. Окончательные требования и решения определяет соответствующее ведомство.</p>
    <p>Сервис не обещает, что все процедуры доступны онлайн или что каждая ситуация уже описана.</p>

    <p><Link className="official-secondary" href="/berlin/start">Составить личный план действий →</Link></p>
  </InfoPage>;
}
