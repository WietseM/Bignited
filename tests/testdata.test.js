const { test, expect} = require('@playwright/test');
const landenVekort = ["AD", "AT", "BE", "BA", "BG", "CR", "HR", "CZ", "DK", "EE", "FI", "FR", "GE", "DE", "GB", "GR", "HU", "IE", "IL", "IT", "KZ", "LV", "LT", "LU", "MD", "MC", "NL", "NO", "PL", "PT", "RO", "RS", "SK", "SI", "ES", "SE", "TR", "UA", "AE"];

test.beforeEach(async ({ page }) => {
 await page.goto('/');

 await page.locator("button[id='/iban-header-button']").click();
});

test('Alles juist ingevuld geeft gewenst resultaat', async ({ page }) => {
    const options = await page.$$eval('#\\/iban-0 > option', sel => {
        return sel.map(option => option.textContent.trim());
    });
    const landen = options.slice(1);
    expect(landen.length).toBe(landenVekort.length);

    const randomNumber = Math.floor(Math.random()*(landen.length+1));
    const selectieLand = await page.locator("select[id='/iban-0']").selectOption({index:randomNumber+1});
    const selectieLandCode = landenVekort[randomNumber];

    await page.locator("input[id='/iban-1']").fill("10");

    await page.locator("button[id='/iban-generate-button']").click();

    const ibanResult = await page.locator("pre[id='iban-text']").innerText();
    const ibanResultArray = ibanResult.match(/.{1,27}/g);

    expect(ibanResultArray.length).toBe(10);
    const regex = new RegExp('^' + selectieLandCode + '\\d{2}[A-Z0-9]{1,30}$');
    for (const result of ibanResultArray){
        expect(result).toMatch(regex);
    }
});

test('Geen land geselecteerd is standaard BE Iban', async ({ page }) => {

 await page.locator("input[id='/iban-1']").fill("10");

 await page.locator("button[id='/iban-generate-button']").click();

 const ibanResult = await page.locator("pre[id='iban-text']").innerText();
 const ibanResultArray = ibanResult.match(/.{1,27}/g);

 const regex = new RegExp('^BE\\d{14}$');
 for (const result of ibanResultArray){
  expect(result).toMatch(regex);
 }
});

test('Geen bedrag ingevuld geeft 1 Iban', async ({ page }) => {

 const options = await page.$$eval('#\\/iban-0 > option', sel => {
  return sel.map(option => option.textContent.trim());
 });
 const landen = options.slice(1);
 expect(landen.length).toBe(landenVekort.length);

 const randomNumber = Math.floor(Math.random()*(landen.length+1));
 const selectieLand = await page.locator("select[id='/iban-0']").selectOption({index:randomNumber+1});
 const selectieLandCode = landenVekort[randomNumber];

 await page.locator("button[id='/iban-generate-button']").click();

 const ibanResult = await page.locator("pre[id='iban-text']").innerText();
 const ibanResultArray = ibanResult.match(/.{1,27}/g);

 expect(ibanResultArray.length).toBe(1);

 const regex = new RegExp('^' + selectieLandCode + '\\d{2}[A-Z0-9]{1,30}$');
 for (const result of ibanResultArray){
  expect(result).toMatch(regex);
 }
});


test('Negatief aantal wordt omgezet in positief aantal', async ({ page }) => {

    await page.locator("input[id='/iban-1']").fill("-3");

    await page.locator("button[id='/iban-generate-button']").click();

    const ibanResult = await page.locator("pre[id='iban-text']").innerText();
    const ibanResultArray = ibanResult.match(/.{1,27}/g);

    expect(ibanResultArray.length).toBe(3);

    const regex = new RegExp('^BE\\d{14}$');
    for (const result of ibanResultArray){
        expect(result).toMatch(regex);
    }
});

test('Te groot aantal geeft error message en limiteert tot max aantal', async ({ page }) => {

    await page.locator("input[id='/iban-1']").fill("110");

    await page.locator("button[id='/iban-generate-button']").click();

    const ibanResult = await page.locator("pre[id='iban-text']").innerText();
    const ibanResultArray = ibanResult.match(/.{1,27}/g);

    expect(ibanResultArray.length).toBe(100);
    const regex = new RegExp('^BE\\d{14}$');
    for (const result of ibanResultArray){
        expect(result).toMatch(regex);
    }
});

test('Test op geldigheid IBAN-Nummers', async ({ page }) => {

    await page.locator("input[id='/iban-1']").fill("30");

    await page.locator("button[id='/iban-generate-button']").click();

    const ibanResult = await page.locator("pre[id='iban-text']").innerText();
    const ibanResultArray = ibanResult.match(/.{1,27}/g);

    const ibanValidationMap = new Map();
    const correctValidationArray = [];
    const validateIbanNumber = (ibanNumber) => {
        const numberPart = ibanNumber.slice(4, -2);
        const controlDigits = ibanNumber.slice(-2);

        const calculatedControl = (parseInt(numberPart) % 97).toString();

        return calculatedControl === controlDigits;
    };

    let correct = 0;
    expect(ibanResultArray.length).toBe(30);
    const regex = new RegExp('^BE\\d{14}$');
    for (const result of ibanResultArray){
        expect(result).toMatch(regex);
        const isValid = validateIbanNumber(result);
        if (isValid){
            correct++;
            correctValidationArray.push(result);
        }
        ibanValidationMap.set(result, isValid ? 'correct' : 'incorrect');
    }


    expect(ibanValidationMap.size).toBe(30);
    expect(correctValidationArray.length).toBe(correct);
    const difference = ibanValidationMap.size === correctValidationArray.length;
    expect(difference).toBeFalsy();
});