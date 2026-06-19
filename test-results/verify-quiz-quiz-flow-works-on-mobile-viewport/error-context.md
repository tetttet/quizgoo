# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: verify-quiz.spec.js >> quiz flow works on mobile viewport
- Location: ../../../../../private/tmp/verify-quiz.spec.js:86:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Продолжить' })
    - locator resolved to <button type="button" class="min-h-10 rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.99]">Продолжить</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div data-testid="pause-overlay" class="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/78 px-6 backdrop-blur-[2px]">…</div> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div data-testid="pause-overlay" class="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/78 px-6 backdrop-blur-[2px]">…</div> intercepts pointer events
    - retrying click action
      - waiting 100ms
    51 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div data-testid="pause-overlay" class="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/78 px-6 backdrop-blur-[2px]">…</div> intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e6]:
          - generic [ref=e7]:
            - paragraph [ref=e8]: Вариант 1
            - heading "Вопрос 1 из 100" [level=1] [ref=e9]
          - generic [ref=e10]:
            - paragraph [ref=e11]: Время
            - paragraph [ref=e12]: 0:00
        - generic [ref=e16]:
          - heading "Время работы пожарных кранов следует принимать … ([60], п.4. 2. 13)" [level=2] [ref=e17]
          - generic [ref=e18]:
            - button "3 ч" [disabled] [ref=e19]
            - button "1 ч" [disabled] [ref=e20]
            - button "5 ч" [disabled] [ref=e21]
            - button "2 ч" [disabled] [ref=e22]
        - generic [ref=e24]:
          - button "Продолжить" [active] [ref=e25]
          - button "Начать заново" [ref=e26]
          - button "Варианты" [ref=e27]
      - generic [ref=e29]:
        - paragraph [ref=e30]: Пауза
        - paragraph [ref=e31]: Таймер остановлен, ответы временно закрыты.
  - button "Open Next.js Dev Tools" [ref=e37] [cursor=pointer]:
    - img [ref=e38]
  - alert [ref=e41]
```

# Test source

```ts
  29  |   let correctAnswer = answers.find((answer) => answer === rawCorrectAnswer);
  30  | 
  31  |   if (!correctAnswer) {
  32  |     const normalizedCorrectAnswer = normalizeForCompare(rawCorrectAnswer);
  33  |     correctAnswer = answers.find((answer) => normalizeForCompare(answer) === normalizedCorrectAnswer);
  34  |   }
  35  | 
  36  |   if (!correctAnswer) {
  37  |     correctAnswer = answers
  38  |       .map((answer) => ({ answer, score: similarity(normalizeForCompare(answer), normalizeForCompare(rawCorrectAnswer)) }))
  39  |       .sort((left, right) => right.score - left.score)[0]?.answer;
  40  |   }
  41  | 
  42  |   return {
  43  |     id: `${variantId}-${index}`,
  44  |     question,
  45  |     answers,
  46  |     correctAnswer,
  47  |   };
  48  | }
  49  | 
  50  | function loadVariant(id) {
  51  |   const raw = JSON.parse(fs.readFileSync(path.join(dataRoot, `${id}.json`), "utf8"));
  52  |   return raw.map((question, index) => normalizeQuestion(question, id, index));
  53  | }
  54  | 
  55  | function parseDuration(value) {
  56  |   const parts = value.split(":").map(Number);
  57  | 
  58  |   if (parts.length === 2) {
  59  |     return parts[0] * 60 + parts[1];
  60  |   }
  61  | 
  62  |   return parts[0] * 3600 + parts[1] * 60 + parts[2];
  63  | }
  64  | 
  65  | function isSequential(order) {
  66  |   return order.every((value, index) => value === index);
  67  | }
  68  | 
  69  | function assertProgressShape(progress) {
  70  |   expect(progress.questionOrder).toHaveLength(100);
  71  |   expect(new Set(progress.questionOrder).size).toBe(100);
  72  |   expect(isSequential(progress.questionOrder)).toBe(false);
  73  |   expect(Object.keys(progress.answerOrders)).toHaveLength(100);
  74  |   expect(Object.values(progress.answerOrders).some((order) => !isSequential(order))).toBe(true);
  75  | }
  76  | 
  77  | async function getProgress(page, variantId) {
  78  |   return page.evaluate((id) => JSON.parse(window.localStorage.getItem(`quizgoo:progress:${id}`)), variantId);
  79  | }
  80  | 
  81  | test.use({
  82  |   viewport: { width: 390, height: 844 },
  83  |   isMobile: true,
  84  | });
  85  | 
  86  | test("quiz flow works on mobile viewport", async ({ page }) => {
  87  |   const consoleErrors = [];
  88  |   const pageErrors = [];
  89  | 
  90  |   page.on("console", (message) => {
  91  |     if (message.type() === "error") {
  92  |       consoleErrors.push(message.text());
  93  |     }
  94  |   });
  95  |   page.on("pageerror", (error) => pageErrors.push(error.message));
  96  | 
  97  |   await page.goto(baseUrl, { waitUntil: "networkidle" });
  98  |   await page.evaluate(() => window.localStorage.clear());
  99  |   await page.reload({ waitUntil: "networkidle" });
  100 | 
  101 |   await expect(page.getByTestId("variant-1")).toBeVisible();
  102 |   await expect(page.getByTestId("variant-4")).toBeVisible();
  103 |   await expect(page.locator("[data-testid^='variant-']")).toHaveCount(4);
  104 | 
  105 |   for (const variantId of ["1", "2", "3", "4"]) {
  106 |     await page.getByTestId(`variant-${variantId}`).click();
  107 |     await expect(page.getByText(`Вариант ${variantId}`).first()).toBeVisible();
  108 |     await expect(page.getByTestId("answer-button")).toHaveCount(4);
  109 |     assertProgressShape(await getProgress(page, variantId));
  110 |     await page.getByRole("button", { name: "Варианты" }).click();
  111 |     await expect(page.getByText("Выберите вариант")).toBeVisible();
  112 |   }
  113 | 
  114 |   await page.getByTestId("variant-1").click();
  115 |   await expect(page.getByText("Вопрос 1 из 100")).toBeVisible();
  116 |   const progressBeforeReload = await getProgress(page, "1");
  117 |   await page.reload({ waitUntil: "networkidle" });
  118 |   await expect(page.getByText("Вопрос 1 из 100")).toBeVisible();
  119 |   const progressAfterReload = await getProgress(page, "1");
  120 |   expect(progressAfterReload.questionOrder).toEqual(progressBeforeReload.questionOrder);
  121 |   expect(progressAfterReload.answerOrders).toEqual(progressBeforeReload.answerOrders);
  122 | 
  123 |   const timerBeforePause = await page.getByTestId("timer").innerText();
  124 |   await page.getByRole("button", { name: "Пауза" }).click();
  125 |   await expect(page.getByTestId("pause-overlay")).toBeVisible();
  126 |   await expect(page.getByTestId("answer-button").first()).toBeDisabled();
  127 |   await page.waitForTimeout(1300);
  128 |   expect(await page.getByTestId("timer").innerText()).toBe(timerBeforePause);
> 129 |   await page.getByRole("button", { name: "Продолжить" }).click();
      |                                                          ^ Error: locator.click: Test timeout of 30000ms exceeded.
  130 |   await page.waitForFunction(() => document.querySelector("[data-testid='timer']")?.textContent !== "0:00", null, {
  131 |     timeout: 3500,
  132 |   });
  133 |   expect(parseDuration(await page.getByTestId("timer").innerText())).toBeGreaterThanOrEqual(1);
  134 | 
  135 |   const variantOneQuestions = loadVariant("1");
  136 |   const currentQuestionText = await page.getByTestId("question-text").innerText();
  137 |   const currentQuestion = variantOneQuestions.find((question) => question.question === currentQuestionText);
  138 |   expect(currentQuestion).toBeTruthy();
  139 |   const answerButtons = page.getByTestId("answer-button");
  140 |   const answerTexts = await answerButtons.allInnerTexts();
  141 |   const wrongAnswerIndex = answerTexts.findIndex((answer) => answer !== currentQuestion.correctAnswer);
  142 |   expect(wrongAnswerIndex).toBeGreaterThanOrEqual(0);
  143 |   await answerButtons.nth(wrongAnswerIndex).click();
  144 | 
  145 |   const wrongClassName = await answerButtons.nth(wrongAnswerIndex).getAttribute("class");
  146 |   const correctButtonIndex = answerTexts.findIndex((answer) => answer === currentQuestion.correctAnswer);
  147 |   const correctClassName = await answerButtons.nth(correctButtonIndex).getAttribute("class");
  148 |   expect(wrongClassName).toContain("rose");
  149 |   expect(correctClassName).toContain("emerald");
  150 | 
  151 |   await page.getByRole("button", { name: "Следующий вопрос" }).click();
  152 |   await expect(page.getByText("Вопрос 2 из 100")).toBeVisible();
  153 |   await page.reload({ waitUntil: "networkidle" });
  154 |   await expect(page.getByText("Вопрос 2 из 100")).toBeVisible();
  155 | 
  156 |   for (let guard = 0; guard < 120; guard += 1) {
  157 |     if (await page.getByTestId("quiz-result").isVisible().catch(() => false)) {
  158 |       break;
  159 |     }
  160 | 
  161 |     await page.getByTestId("answer-button").first().click();
  162 |     const finishButton = page.getByRole("button", { name: "Завершить" });
  163 | 
  164 |     if (await finishButton.isVisible().catch(() => false)) {
  165 |       await finishButton.click();
  166 |       break;
  167 |     }
  168 | 
  169 |     await page.getByRole("button", { name: "Следующий вопрос" }).click();
  170 |   }
  171 | 
  172 |   await expect(page.getByTestId("quiz-result")).toBeVisible({ timeout: 10000 });
  173 |   await expect(page.getByText(/Правильно/)).toBeVisible();
  174 |   await page.getByRole("button", { name: "Пройти заново" }).click();
  175 |   await expect(page.getByText("Вопрос 1 из 100")).toBeVisible();
  176 |   const restartedProgress = await getProgress(page, "1");
  177 |   expect(restartedProgress.currentQuestionIndex).toBe(0);
  178 |   expect(restartedProgress.isCompleted).toBe(false);
  179 | 
  180 |   const hasOverlay = await page.evaluate(() => Boolean(document.querySelector("[data-nextjs-dialog]")));
  181 |   expect(hasOverlay).toBe(false);
  182 |   expect(consoleErrors).toEqual([]);
  183 |   expect(pageErrors).toEqual([]);
  184 | });
  185 | 
```