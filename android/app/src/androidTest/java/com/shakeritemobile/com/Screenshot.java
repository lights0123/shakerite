package com.shakeritemobile.com;


import androidx.test.espresso.Espresso;
import androidx.test.espresso.web.model.Atoms;
import androidx.test.espresso.web.sugar.Web;
import androidx.test.filters.LargeTest;
import androidx.test.rule.ActivityTestRule;

import org.junit.AfterClass;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

import tools.fastlane.screengrab.Screengrab;
import tools.fastlane.screengrab.UiAutomatorScreenshotStrategy;
import tools.fastlane.screengrab.cleanstatusbar.BluetoothState;
import tools.fastlane.screengrab.cleanstatusbar.CleanStatusBar;
import tools.fastlane.screengrab.cleanstatusbar.MobileDataType;

@LargeTest
@RunWith(JUnit4.class)
public class Screenshot {
    @Rule
    public ActivityTestRule<MainActivity> mActivityTestRule = new ActivityTestRule<>(MainActivity.class);

    @Before
    public void setUp() {
        Screengrab.setDefaultScreenshotStrategy(new UiAutomatorScreenshotStrategy());

        new CleanStatusBar()
                .setBluetoothState(BluetoothState.DISCONNECTED)
                .setClock("0941")
                .setShowNotifications(false)
                .enable();
    }

    @AfterClass
    public static void afterAll() {
        CleanStatusBar.disable();
    }


    private static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    private static void clickPath(String css) {
        Web.onWebView().perform(Atoms.script("return document.querySelector('" + css + "').click()"));
    }

    @Test
    public void screenshot() {
        sleep(5000);
        Screengrab.screenshot("01Home");
        clickPath("app-news > ion-content > ion-card:not(.small)");
        sleep(5000);
        Screengrab.screenshot("02Article");
        clickPath("app-article > ion-header > ion-toolbar > ion-buttons.buttons-last-slot > ion-button:first-child");
        sleep(2000);
        Screengrab.screenshot("03Fonts");
        Espresso.pressBack();
        clickPath("#tab-button-saved");
        sleep(2000);
        Screengrab.screenshot("04Saved");
        sleep(500);
        clickPath("#tab-button-settings");
        sleep(500);
        Screengrab.screenshot("05Social");
    }
}
