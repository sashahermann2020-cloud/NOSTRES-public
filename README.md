# NOSTRES

**A free, independent guide that helps people who have moved abroad go through official procedures step by step: what applies to their situation, in which order, and where the official service is.**

Website: <https://nostres.world> · Contact: <https://nostres.world/contact>

NOSTRES: бесплатный независимый сервис для тех, кто переехал в другую страну и хочет самостоятельно пройти официальные процедуры: понять, что нужно именно в их ситуации, получить порядок действий и перейти к официальной услуге. Интерфейс на русском языке, доступен на девяти языках.

## What it is

NOSTRES turns an administrative task into a short check of the person's situation and a personal plan. The pilot covers **Germany, first city Berlin**; the interface is Russian-first and available in nine languages, while official pages stay in German.

Typical tasks: registering an address (Anmeldung), tax ID, health insurance, finding a flat, residence permit renewal, finding a doctor, setting up a business or freelance work, a bank account, mobile and internet, benefits for families, job loss, transport tickets, and moving with a pet. The full list is in [docs/ROUTES.md](docs/ROUTES.md).

## What it is not

- It does not submit applications, hold documents, take payments or act on behalf of the user. It sends people to the official form, appointment page or register.
- It gives no legal, tax or financial advice. It is not a government service.
- The MVP has no paid specialists, no commissions, no chat and no user accounts.

## How a route works

1. A few questions, asked only if the answer changes the result.
2. A personal result with an explanation: "why this result".
3. Ways to proceed where they exist (online, in person, by mail, by phone), with the documents and conditions of the chosen way.
4. Steps, the expected outcome, the next dependent route, and links to **official sources**.

Every deadline, amount and condition carries a label of how reliable it is: statutory, agency guideline, data from a provider or bank, NOSTRES estimate, or depends on workload. Provider options (banks, mobile operators, vets) come only from the companies' own official pages and are dated. They are not rankings or recommendations. Search results, forums and personal experience can suggest a topic but never replace an official source. See [docs/SOURCE_POLICY.md](docs/SOURCE_POLICY.md).

## Accessibility and people who find calls or visits hard

The start plan lets a person choose online-only paths, mark that visits are difficult or impossible, and prefer written communication, without explaining why. Routes show only the ways confirmed by official conditions; if no remote path is confirmed, the route says so and points to the official next step. A text-size button enlarges text by 20% or 45%.

## Privacy

Answers and progress stay in the person's browser. The server receives only technical events and anonymous feedback; the service does not ask for names, addresses or document numbers, and documents are never uploaded. See <https://nostres.world/privacy>.

## Coverage

| Area | Status |
|---|---|
| Berlin, Germany | Pilot: 53 routes, a start plan and topic pages |
| Other cities and countries | Planned; not published |

## About this repository

This repository holds the public description of NOSTRES and a **mirror of its application source code**, so anyone can review how the service works and how it handles data.

- **What is mirrored:** the application (`app/`, `worker/`, `db/`, `drizzle/`), translations (`i18n/`, `public/`), build scripts, tests and build configuration, plus the two technical registries the tests need (`docs/ROUTE_REGISTRY.json`, `docs/VISUAL_REFERENCE.json`).
- **What is not mirrored:** internal working documents, research notes and route specifications. Two tests that cross-check code against the internal route specification are skipped here and run in the private repository.
- **How it is updated:** the mirror is a snapshot of the private `main` branch, published only after the full set of checks passes there (build, lint, type check, accessibility lint, dependency audit, tests). Before every update the files are scanned for keys and secrets; any finding stops the update. Commit history of the private repository is not carried over.
- **Run it locally:** Node.js 22.18 or newer, then `npm ci` and `npm test`.

Route content is informational: check every condition on the official website before acting.

## Support NOSTRES

NOSTRES is free for its users and stays free. Development, checking routes against official sources and translations are funded by voluntary support. Support through [Open Collective](https://opencollective.com/nostres) (fiscal host: Open Source Europe). See [SPONSORS.md](SPONSORS.md) for how support is used and who cannot be a sponsor.

## Security

Found a vulnerability or a data leak? See [SECURITY.md](SECURITY.md).

## License

The source code is licensed under the [GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0-only).
