package com.shakeritemobile.com;


import androidx.test.espresso.Espresso;
import androidx.test.espresso.web.model.Atom;
import androidx.test.espresso.web.model.ElementReference;
import androidx.test.espresso.web.sugar.Web;
import androidx.test.espresso.web.webdriver.DriverAtoms;
import androidx.test.espresso.web.webdriver.Locator;
import androidx.test.filters.LargeTest;
import androidx.test.rule.ActivityTestRule;
import androidx.test.runner.AndroidJUnit4;

import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import tools.fastlane.screengrab.Screengrab;
import tools.fastlane.screengrab.UiAutomatorScreenshotStrategy;
import tools.fastlane.screengrab.locale.LocaleTestRule;

import static androidx.test.espresso.web.webdriver.DriverAtoms.webClick;

@LargeTest
@RunWith(AndroidJUnit4.class)
public class Screenshot {

    @Rule
    public ActivityTestRule<MainActivity> mActivityTestRule = new ActivityTestRule<>(MainActivity.class);

    @Before
    public void setUp() {
        Screengrab.setDefaultScreenshotStrategy(new UiAutomatorScreenshotStrategy());
    }

    private static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    private static void clickPath(String XPath){
        Atom<ElementReference> element = DriverAtoms.findElement(Locator.XPATH, XPath);
        Web.onWebView().withElement(element).perform(webClick());
    }

    @Test
    public void screenshot() {
        sleep(10000);
        Screengrab.screenshot("01Home");
        clickPath("//*[@id=\"app\"]/ion-tabs/ion-tab[1]/ion-router-outlet/ion-page/ion-content/ion-card[1]");
        sleep(5000);
        Screengrab.screenshot("02Article");
        clickPath("//*[@id=\"app\"]/ion-tabs/ion-tab[1]/ion-router-outlet/ion-page/ion-header/ion-toolbar/ion-buttons[2]/ion-button[1]");
        sleep(2000);
        Screengrab.screenshot("03Fonts");
        Espresso.pressBack();
        clickPath("//*[@id=\"tab-button-saved\"]");
        sleep(2000);
        Screengrab.screenshot("04Saved");
        sleep(500);
        clickPath("//*[@id=\"tab-button-settings\"]");
        sleep(500);
        Screengrab.screenshot("05Social");
    }
}
