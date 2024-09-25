const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/');

    await page.locator("button[id='/bis-header-button']").click();
});

test('Alles juist ingevuld met gender known en birthdate known geeft gewenst resultaat', async ({ page }) => {
    await page.locator("input[id='/bis-yes-0']").click();

    await page.locator("input[id='/bis-yes-1']").click();

    await page.locator("input[id='/bis-2']").fill("1997-03-19");

    await page.locator("input[id='/bis-3']").fill("10");

    await page.locator("button[id='/bis-generate-button']").click();

    const bisResult = await page.locator("pre[id='bis-text']").innerText();
    const bisResultArray = bisResult.match(/.{1,27}/g);

    expect(bisResultArray.length).toBe(10);

    const regex = new RegExp('^974319\\d{5}$');
    for (const result of bisResultArray){
        expect(result).toMatch(regex);
    }
});

test('Alles juist ingevuld met gender not known en birthdate known geeft gewenst resultaat', async ({ page }) => {
    await page.locator("input[id='/bis-no-0']").click();

    await page.locator("input[id='/bis-yes-1']").click();

    await page.locator("input[id='/bis-2']").fill("1997-03-19");

    await page.locator("input[id='/bis-3']").fill("10");

    await page.locator("button[id='/bis-generate-button']").click();

    const bisResult = await page.locator("pre[id='bis-text']").innerText();
    const bisResultArray = bisResult.match(/.{1,27}/g);

    expect(bisResultArray.length).toBe(10);

    const regex = new RegExp('^972319\\d{5}$');
    for (const result of bisResultArray){
        expect(result).toMatch(regex);
    }
});

test('Alles juist ingevuld met gender known en birthdate not known geeft gewenst resultaat', async ({ page }) => {
    await page.locator("input[id='/bis-yes-0']").click();

    await page.locator("input[id='/bis-no-1']").click();

    const date = page.locator("input[id='/bis-2']");

    await expect(date).toBeDisabled();

    await page.locator("input[id='/bis-3']").fill("10");

    await page.locator("button[id='/bis-generate-button']").click();

    const bisResult = await page.locator("pre[id='bis-text']").innerText();
    const bisResultArray = bisResult.match(/.{1,27}/g);

    expect(bisResultArray.length).toBe(10);

    const regex = new RegExp('^\\d{2}40\\d{7}$');
    for (const result of bisResultArray){
        expect(result).toMatch(regex);
    }
});

test('Alles juist ingevuld met gender not known en birthdate not known geeft gewenst resultaat', async ({ page }) => {
    await page.locator("input[id='/bis-no-0']").click();

    await page.locator("input[id='/bis-no-1']").click();

    const date = page.locator("input[id='/bis-2']");

    await expect(date).toBeDisabled();


    await page.locator("input[id='/bis-3']").fill("10");

    await page.locator("button[id='/bis-generate-button']").click();

    const bisResult = await page.locator("pre[id='bis-text']").innerText();
    const bisResultArray = bisResult.match(/.{1,27}/g);

    expect(bisResultArray.length).toBe(10);

    const regex = new RegExp('^\\d{11}$');
    for (const result of bisResultArray){
        expect(result).toMatch(regex);
    }
});

test('Negatief aantal wordt omgezet in positief aantal', async ({ page }) => {

    await page.locator("input[id='/bis-3']").fill("-5");

    await page.locator("button[id='/bis-generate-button']").click();

    const bisResult = await page.locator("pre[id='bis-text']").innerText();
    const bisResultArray = bisResult.match(/.{1,27}/g);

    expect(bisResultArray.length).toBe(5);

    const regex = new RegExp('^\\d{2}(4\\d|5[0-2])\\d{7}$');
    for (const result of bisResultArray){
        expect(result).toMatch(regex);
    }
});

test('Te groot aantal geeft error message en limiteert tot max aantal', async ({ page }) => {
    await page.locator("input[id='/bis-3']").fill("120");

    await page.locator("button[id='/bis-generate-button']").click();

    const bisResult = await page.locator("pre[id='bis-text']").innerText();
    const bisResultArray = bisResult.match(/.{1,27}/g);

    expect(bisResultArray.length).toBe(100);

    const regex = new RegExp('^\\d{2}(4\\d|5[0-2])\\d{7}$');
    for (const result of bisResultArray){
        expect(result).toMatch(regex);
    }
});

test('Test op geldigheid bis-nummers', async ({ page }) => {
    await page.locator("input[id='/bis-3']").fill("30");

    await page.locator("button[id='/bis-generate-button']").click();

    const bisResult = await page.locator("pre[id='bis-text']").innerText();
    const bisResultArray = bisResult.match(/.{1,27}/g);

    expect(bisResultArray.length).toBe(30);

    const bisValidationMap = new Map();
    const correctValidationArray = [];
    const validateBisNumber = (bisNumber) => {
        const numberPart = bisNumber.slice(0, -2);
        const controlDigits = bisNumber.slice(-2);

        const calculatedControl = (97 - (parseInt(numberPart) % 97)).toString();

        return calculatedControl === controlDigits;
    };

    const regex = new RegExp('^\\d{2}(4\\d|5[0-2])\\d{7}$');

    let correct = 0;
    for (const result of bisResultArray){
        expect(result).toMatch(regex);
        const isValid = validateBisNumber(result);
        if (isValid){
            correct++;
            correctValidationArray.push(result);
        }
        bisValidationMap.set(result, isValid ? 'correct' : 'incorrect');
    }

    expect(bisValidationMap.size).toBe(30);
    expect(correctValidationArray.length).toBe(correct);
    const difference = bisValidationMap.size === correctValidationArray.length;
    expect(difference).toBeFalsy();
});

