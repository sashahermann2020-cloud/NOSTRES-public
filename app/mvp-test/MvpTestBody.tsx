"use client";

import Link from "../i18n/link";
import ExplainedText from "../ExplainedText";
import HeaderTools from "../i18n/HeaderTools";
import { tr, useLocale } from "../i18n/store";

const testRoutes = [
  {
    href: "/berlin/anmeldung",
    number: "01",
    title: "Anmeldung (регистрация адреса)",
    description: "Anmeldung (регистрация места жительства) онлайн или лично в районном ведомстве (Bürgeramt).",
  },
  {
    href: "/berlin/steuer-id",
    number: "02",
    title: "Steuer-ID (налоговый номер)",
    description: "Первая выдача, поиск или повторное получение Steuer-ID (личного налогового номера).",
  },
  {
    href: "/berlin/health-insurance",
    number: "03",
    title: "Krankenversicherung (медицинская страховка)",
    description: "Выбор официального пути к страхованию и электронной медицинской карте (eGK).",
  },
  {
    href: "/berlin/wohnungssuche",
    number: "04",
    title: "Wohnungssuche (поиск квартиры или комнаты)",
    description: "Проверка документов, поиск квартиры или комнаты и план действий после ответов на пять вопросов.",
  },
  {
    href: "/berlin/aufenthalt",
    number: "05",
    title: "Aufenthaltstitel (продление вида на жительство)",
    description: "Подбор услуги LEA, официальная онлайн-форма, приглашение на приём и действия при проблеме.",
  },
  { href: "/berlin/vrach", number: "06", title: "Arztsuche (поиск врача и запись)", description: "Страховка, тип врача, поиск практики и официальная запись через 116117, когда она применима." },
  { href: "/berlin/srochnaya-pomoshch", number: "07", title: "Notfall (срочная медицинская помощь)", description: "Следующее действие при угрозе жизни, срочной неэкстренной проблеме или сомнении о срочности." },
  { href: "/berlin/bank", number: "09", title: "Girokonto (банковский счёт)", description: "Обычный счёт или Basiskonto, документы, адрес и действия при отказе банка." },
  { href: "/berlin/svyaz", number: "10", title: "Mobilfunk и Internet (мобильная связь и интернет)", description: "Что проверить до договора, смена провайдера, расторжение и права при проблемах." },
  { href: "/berlin/sobaka/marshrut", number: "11", title: "Hund (собака: регистрация, налог, опасные породы)", description: "Регистрация в реестре, налог, правила прогулок и порядок для опасных пород (Listenhunde)." },
  { href: "/berlin/samostoyatelnaya-rabota", number: "08", title: "Gewerbe или Freiberuf (своё дело или фриланс)", description: "Право на деятельность, вид работы, онлайн или личная регистрация Gewerbe и налоговая анкета." },
  { href: "/berlin/kindergeld", number: "13", title: "Kindergeld (пособие на ребёнка)", description: "Кто может получить, как подать онлайн или с подписью, какие документы нужны и что делать, если ответа нет." },
  { href: "/berlin/jobcenter", number: "14", title: "Agentur für Arbeit и Jobcenter (потеря работы и пособия)", description: "Регистрация безработным, Arbeitslosengeld и Grundsicherung в Jobcenter." },
  { href: "/berlin/kita-schule", number: "15", title: "Kita, Schule und Geburt (детский сад, школа, рождение ребёнка)", description: "Kita-Gutschein, запись в школу и сообщение о рождении в Standesamt." },
  { href: "/berlin/rabota-po-najmu", number: "16", title: "Stellensuche (поиск работы по найму)", description: "Можно ли работать, где искать вакансии, что делать при нарушении условий." },
  { href: "/berlin/elterngeld", number: "17", title: "Elterngeld (пособие родителям после рождения ребёнка)", description: "Право, документы, форма по дате рождения и подача в Elterngeldstelle." },
  { href: "/berlin/kinderzuschlag", number: "18", title: "Kinderzuschlag (доплата к Kindergeld для семей с небольшим доходом)", description: "Условия, доход, имущество и заявление в Familienkasse." },
  { href: "/berlin/steuererklaerung", number: "19", title: "Einkommensteuererklärung (налоговая декларация)", description: "Обязанность, сроки и способы подачи: ELSTER, бумага, консультант." },
  { href: "/berlin/elternzeit", number: "20", title: "Elternzeit (родительский отпуск)", description: "Уведомление работодателя, сроки, неполный день, защита от увольнения и страховка." },
  { href: "/berlin/wohngeld", number: "21", title: "Wohngeld (жилищная доплата к аренде или расходам на жильё)", description: "Право, документы и подача заявления онлайн или на бумаге." },
  { href: "/berlin/mutterschutz", number: "22", title: "Mutterschutz und Mutterschaftsgeld (защита материнства и пособие по материнству)", description: "Защита, пособие, доплата работодателя и заявление." },
  { href: "/berlin/bildungspaket", number: "23", title: "Bildungs- und Teilhabepaket (помощь на школу и досуг детей)", description: "Обед, школьные принадлежности, поездки, репетитор и досуг." },
  { href: "/berlin/pflegegeld", number: "24", title: "Pflegegeld und Pflegegrad (пособие по уходу и степень нуждаемости в уходе)", description: "Узнать, как получить Pflegegrad и Pflegegeld и куда подать заявление." },
  { href: "/berlin/schwerbehinderung", number: "25", title: "Schwerbehindertenausweis (удостоверение тяжёлой инвалидности)", description: "Подать заявление в Versorgungsamt, догрузить документы или понять решение с GdB." },
  { href: "/berlin/wohnungsgeber", number: "26", title: "Wohnungsgeberbestätigung (подтверждение заселения от арендодателя)", description: "Получить или выдать подтверждение заселения, нужное для регистрации адреса." },
  { href: "/berlin/umzug", number: "27", title: "Umzug (переезд и смена адреса)", description: "Сменить адрес, обновить документы и сообщить о переезде." },
  { href: "/berlin/arbeitslosengeld", number: "28", title: "Arbeitslosengeld (пособие по безработице)", description: "Проверить право, размер и срок Arbeitslosengeld и избежать блокировки." },
  { href: "/berlin/grundsicherungsgeld", number: "29", title: "Grundsicherungsgeld (бывшее Bürgergeld: основное пособие для нуждающихся)", description: "Узнать, сколько положено, и подать заявление в Jobcenter." },
  { href: "/berlin/kfz-ummeldung", number: "30", title: "Kfz-Ummeldung (перерегистрация автомобиля после переезда)", description: "Перерегистрировать машину или внести новый адрес в документ." },
  { href: "/berlin/einbuergerung", number: "31", title: "Einbürgerung (получение гражданства Германии)", description: "Проверить условия и подать онлайн-заявление на гражданство." },
  { href: "/berlin/aufenthalt-rabota", number: "32", title: "Aufenthaltstitel für Beschäftigung (вид на жительство для работы)", description: "Выбрать путь: Blue Card, специалист или Chancenkarte." },
  { href: "/berlin/anerkennung", number: "33", title: "Anerkennung (признание иностранного диплома или профессии)", description: "Найти ведомство и подать на признание." },
  { href: "/berlin/integrationskurs", number: "34", title: "Integrationskurs (интеграционный и языковой курс)", description: "Получить допуск и записаться на курс." },
  { href: "/berlin/familiennachzug", number: "35", title: "Familiennachzug (воссоединение семьи)", description: "Вид на жительство для супруга или ребёнка." },
  { href: "/berlin/sprachkurs", number: "36", title: "Sprachkurs (языковые курсы)", description: "Выбрать язык изучения, язык объяснений и курс." },
  { href: "/berlin/studium-ausbildung", number: "37", title: "Университет, Studienkolleg и Ausbildung", description: "Выбрать, куда поступать и на каком языке учиться." },
  { href: "/berlin/pereezd-s-zhivotnym", number: "38", title: "Переезд с животным в Германию", description: "Чип, прививка, тест на антитела, сертификат и пункт ввоза." },
  { href: "/berlin/heimtierausweis", number: "39", title: "EU-Heimtierausweis (паспорт животного ЕС)", description: "Кто выдаёт паспорт и что сделать до него." },
  { href: "/berlin/veterinar", number: "40", title: "Tierarzt (ветеринар в Берлине)", description: "Срочная помощь и практики на вашем языке." },
  { href: "/berlin/dressirovka", number: "41", title: "Hundeschule und Hundeführerschein (дрессировка и экзамен владельца собаки)", description: "Дрессировщик с разрешением, экзамен и Wesenstest." },
  { href: "/berlin/pereezd-v-germaniyu", number: "42", title: "Переезд в Германию: какой путь вам подходит", description: "Нужна ли виза и какой путь подходит по гражданству и цели." },
  { href: "/berlin/chancenkarte", number: "43", title: "Chancenkarte (карта возможностей для поиска работы)", description: "Баллы, средства, документы и подача визы." },
  { href: "/berlin/viza-rabota", number: "44", title: "Виза для работы: Blue Card и специалисты", description: "Вид визы, согласие Bundesagentur für Arbeit и подача до переезда." },
  { href: "/berlin/viza-volontyor", number: "45", title: "Виза для волонтёров: BFD, FSJ, FÖJ и ESC", description: "Место службы, условия по возрасту и документы для визы." },
  { href: "/berlin/viza-uchyoba", number: "46", title: "Виза для учёбы, поступления и Ausbildung", description: "Средства на 2026 год, Sperrkonto и подача визы." },
  { href: "/berlin/psihicheskoe-zdorovye", number: "51", title: "Psychische Gesundheit (психическое здоровье)", description: "Кризисная помощь без звонка, психиатр, психотерапия, помощь близкому и пропуск встречи в Jobcenter." },
  { href: "/berlin/notar", number: "50", title: "Notar (нотариус в Берлине)", description: "Поиск нотариуса, цена по закону GNotKG, расчёт для GmbH и UG, заверение лично или по видео." },
  { href: "/berlin/niederlassungserlaubnis", number: "49", title: "Niederlassungserlaubnis (бессрочный вид на жительство)", description: "Специалисты, Blue Card, семья граждан Германии, признанные беженцы и общие правила: срок, немецкий, документы и подача в LEA." },
  { href: "/berlin/sozialversicherungsnummer", number: "48", title: "Sozialversicherungsnummer (номер социального страхования)", description: "Первая работа, неизвестный номер, бесплатный Versicherungsnummernachweis, номер медицинской страховки на карте eGK." },
  { href: "/berlin/gmbh-ug", number: "47", title: "GmbH или UG (компания с ограниченной ответственностью)", description: "Капитал, договор у нотариуса, Handelsregister, Gewerbe, налоговая анкета, Transparenzregister и годовая отчётность." },
  { href: "/berlin/wbs", number: "12", title: "WBS (разрешение на социальное жильё)", description: "Статус пребывания, срок проживания, документы и подача заявления онлайн, почтой или лично." },
];

/** Видимая часть страницы тестирования; следует за языком интерфейса. */
export default function MvpTestBody() {
  useLocale();
  return (
    <>
      <header className="site-header route-page-header">
          <Link className="brand" href="/" aria-label={tr("NOSTRES — на главную")}>
            <span className="brand-mark" aria-hidden="true">N</span>
            <span className="brand-copy"><b>NOSTRES</b><small>{tr("Понятный путь")}</small></span>
          </Link>
          <span className="pilot-badge">{tr("Тестирование сервиса")}</span>
          <div className="header-actions"><Link className="back-link" href="/">{tr("Все маршруты")}</Link><HeaderTools /></div>
        </header>
  
        <section className="test-hero">
          <div>
            <p className="overline">{tr("Берлин · 10–15 минут · без личных данных")}</p>
            <h1>{tr("Помогите проверить, доводит ли NOSTRES до действия")}</h1>
          </div>
          <p>{tr("NOSTRES должен помогать человеку самому понять, что делать дальше, и дойти до нужной официальной страницы, формы или записи. Ваш тест покажет, получается ли это на деле и в каком месте маршрут сбивает с толку.")}</p>
        </section>

        <section className="test-goal" aria-labelledby="test-goal-title">
          <div className="route-section-heading"><div><p className="overline">{tr("Зачем этот тест")}</p><h2 id="test-goal-title">{tr("Что мы хотим узнать")}</h2></div></div>
          <div className="test-goal-grid">
            <div><b>{tr("Понятен ли следующий шаг")}</b><p>{tr("Понимаете ли вы без подсказок, что сделать первым: какой документ нужен, куда идти или где подать онлайн, есть ли срок.")}</p></div>
            <div><b>{tr("Доходит ли маршрут до действия")}</b><p>{tr("Приводит ли маршрут к нужной официальной странице, форме или записи, а не обрывается на общих советах.")}</p></div>
            <div><b>{tr("Где маршрут мешает")}</b><p>{tr("Непонятные слова, лишние вопросы, нет вашего случая, ссылка ведёт не туда — всё, из-за чего вы остановились или засомневались.")}</p></div>
          </div>
          <p className="test-goal-note">{tr("По вашим оценкам мы решим, какие маршруты исправить в первую очередь и готов ли сервис к более широкому запуску. Поэтому главный результат теста — короткая оценка в конце маршрута.")}</p>
        </section>

        <div className="test-layout">
          <section className="test-protocol" aria-labelledby="test-protocol-title">
            <div className="route-section-heading"><div><p className="overline">{tr("Как проходит тест")}</p><h2 id="test-protocol-title">{tr("Шесть шагов")}</h2></div></div>
            <ol>
              <li><span>1</span><div><b>{tr("Выберите один маршрут ниже")}</b><p>{tr("Лучше задачу, с которой вы сталкивались сами или которую хорошо понимаете: так вы сразу заметите, если чего-то не хватает или что-то неверно.")}</p></div></li>
              <li><span>2</span><div><b>{tr("Ответьте на вопросы так, как ответили бы в жизни")}</b><p>{tr("Имя, адрес, номера документов и медицинские сведения не нужны — сервис их не спрашивает. Затем нажмите кнопку под вопросами, чтобы получить личный план.")}</p></div></li>
              <li><span>3</span><div><b>{tr("Выберите способ")}</b><p>{tr("Если способов несколько (онлайн, по почте, лично), выберите тот, который подошёл бы вам. Откроются подготовка и этапы.")}</p></div></li>
              <li><span>4</span><div><b>{tr("Прочитайте этапы, но ничего не делайте на официальных сайтах")}</b><p>{tr("Проверьте, понятно ли, что сделать первым, какие нужны документы и есть ли срок. Ничего подавать и заполнять не нужно. Отмечать этапы выполненными и блок «Подтвердите результат» тоже не нужно: они для тех, кто действует по-настоящему.")}</p></div></li>
              <li><span>5</span><div><b>{tr("Откройте официальную ссылку первого этапа")}</b><p>{tr("Убедитесь, что она ведёт туда, куда обещано, и что дальше вы смогли бы действовать сами. На этом ваша часть маршрута закончена.")}</p></div></li>
              <li><span>6</span><div><b>{tr("Оцените маршрут — это главный результат теста")}</b><p>{tr("Сразу под этапами нажмите «Да, помог» или «Нет, не помог» — это одно нажатие. Если хотите, ниже откроется подробная оценка из четырёх коротких вопросов. Без ответа мы не узнаем, как прошёл тест.")}</p></div></li>
            </ol>
          </section>

          <aside className="test-privacy">
            <span className="feedback-mark">N</span>
            <div><b>{tr("Что спросит оценка")}</b><p>{tr("Насколько понятным был маршрут, понятно ли, что делать дальше, удалось ли перейти к официальному действию и что сильнее всего мешало.")}</p></div>
            <div><b>{tr("Нашли ошибку в ссылке?")}</b><p>{tr("Если официальная страница не открывается или устарела, сообщите через блок «Нашли ошибку или устаревшую ссылку?» в конце маршрута.")}</p></div>
            <div><b>{tr("Что сохраняется")}</b><p>{tr("Маршрут, выбранный способ, технический статус прохождения и ответы короткой оценки.")}</p></div>
            <div><b>{tr("Что не сохраняется")}</b><p>{tr("Ответы на опросник, имя, email, документы, адрес, Steuer-ID, номер страховки и медицинские сведения.")}</p></div>
          </aside>
        </div>
  
        <section className="test-route-section" aria-labelledby="test-routes-title">
          <div className="section-heading compact-heading"><div><p className="overline">{tr("Выберите задачу")}</p><h2 id="test-routes-title">{tr("Один маршрут за один тест")}</h2></div><p>{tr("Если ни одна ситуация вам не знакома, выберите правдоподобную и отвечайте за такого человека. Если среди ответов нет вашего случая, отметьте в оценке «Нет моего случая». Можно пройти несколько маршрутов — по одной оценке на каждый.")}</p></div>
          <div className="test-route-grid">
            {testRoutes.map((route) => <Link href={route.href} key={route.href}><span>{route.number}</span><h3><ExplainedText text={route.title} /></h3><p>{tr(route.description)}</p><b>{tr("Начать тест маршрута")}</b></Link>)}
          </div>
        </section>
  
        <div className="prototype-note"><span>{tr("Контролируемый тест")}</span><p>{tr("Оценка не заменяет юридическую, налоговую или медицинскую консультацию. Условия действия всегда проверяйте на официальной странице.")}</p></div>
    </>
  );
}
