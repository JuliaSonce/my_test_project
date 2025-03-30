import { test, expect } from '@playwright/test';


let specialization = "Zahnarzt"
let location = "Regensburg"

test.beforeEach('Go to the main page', async ({ page }) => {
    const cookieAcceptButton = page.locator('button:has-text("Akzeptieren")');
    await page.goto('https://jameda.de/');
    await cookieAcceptButton.click()
    await expect(page).toHaveTitle(/jameda/);
});
test('Search for Zahnarzt in Regensburg', async ({ page }) => {


    const searchSpecialistInputField = page.locator('[id="homepage-search"] [data-id="autocomplete-search"]');
    const searchLocationField = page.locator('[id="homepage-search"] [data-id="autocomplete-location"]')
    const searchButton = page.locator('[class="search-button btn btn-lg btn-block btn-primary"]');
    const searchResultsContainer = page.locator('[data-test-id="search-listing-container"]');
    const searchTitle = page.locator('[data-test-id="search-listing-containerr"]:has-text(" Zahnarzt, Regensburg")');
    const title = page.locator('[data-test-id="search-headline"]');

    const listingContainer = page.locator('[data-test-id="search-listing-container"]')
    const doctorCard = page.locator('.card[data-test-id="result-item"][data-eec-entity-type="doctor"]');
    const doctorName = ('[data-tracking-id="result-card-name"]');
    const facilityCard = page.locator('.card[data-test-id="result-item"][data-test-entity-type="facility"]');
    const facilityName = facilityCard.locator('[data-tracking-id="result-card-name"]');
    const doctorSpecialization = ('[data-test-id="doctor-specializations"]');
    const wizard = doctorCard.locator('[data-id="search-calendar"]')
    const availableSlot = wizard.locator('.calendar-slot-available')

    const showPhoneButton = wizard.getByText('Telefonnummer anzeige')
    const showProfileButton = wizard.getByText('Profil anzeigen')



    const doctorFullName = page.locator('[data-test-id="doctor-card-full-name"]');

    await searchSpecialistInputField.click()
    await searchSpecialistInputField.fill(specialization);
    await searchLocationField.click();
    await searchLocationField.fill(location);
    await searchButton.click()
    await expect(title).toHaveText('Zahnarzt, Regensburg');
    //validate that the page contain minimum one doctor's card
    const allDoctorCards = await doctorCard.all()
    await expect(allDoctorCards.length).toBeGreaterThan(0)

    //Validate that doctor's card should contain: Doctor's name and specialization
    let bookingButton;
    let nameOfSelectedDoctor;
    for (let i = 0; i < allDoctorCards.length; i++) {
        const cardPage = allDoctorCards[i];
        const doctorName = cardPage.locator('[data-tracking-id="result-card-name"]');
        const doctorSpecialization = cardPage.locator('[data-test-id="doctor-specializations"]');
        const nextCarouselButton = cardPage.locator('button[aria-label="Next"]')

        // Validate visibility of doctor's name and specialization
        await expect(doctorName).toBeVisible({ timeout: 2000 });
        await expect(doctorSpecialization).toContainText(/Zahnarzt|Zahnärztin/);
        await expect(nextCarouselButton).toBeVisible()
        const nextButton = cardPage.locator('[class= "btn btn-lg btn-light"]')
        const availableSlots = cardPage.locator('.calendar-slot.calendar-slot-available')
        const getAvailableSlotsCount = await availableSlots.count();
        if (getAvailableSlotsCount > 0) {
            nameOfSelectedDoctor = await doctorName.textContent()
            bookingButton = await availableSlots.first()
            break;

        } else {
            const nextButtonCount = await nextButton.count();
            if (nextButtonCount > 0) {
                await nextButton.first().click();
                nameOfSelectedDoctor = await doctorName.textContent();
                bookingButton = await availableSlots.first();
                break;
            }
        }
    }
    await nameOfSelectedDoctor.click()

    await expect(page).toHaveURL(/booking/)
    await expect(doctorFullName).toBeVisible()
    await expect(doctorFullName).toHaveText(nameOfSelectedDoctor);

});



