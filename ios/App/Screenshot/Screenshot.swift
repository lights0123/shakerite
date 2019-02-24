//
//  Screenshot.swift
//  Screenshot
//
//  Created by Ben Schattinger on 2/21/19.
//

import XCTest
import SimulatorStatusMagic

class Screenshot: XCTestCase {
	
	override func setUp() {
		super.setUp()
		// In UI tests it’s important to set the initial state - such as interface orientation - required for your tests before they run. The setUp method is a good place to do this.
		let app = XCUIApplication()
		setupSnapshot(app)
		app.launch()
		SDStatusBarManager.sharedInstance().enableOverrides()
		let about = app.webViews.buttons["paper News"]
		XCTAssert(about.waitForExistence(timeout: 15))
		XCTAssert(about.exists)
		
	}
	
	override func tearDown() {
		SDStatusBarManager.sharedInstance().disableOverrides()
	}
	
	private func waitArticles(webViewsQuery: XCUIElementQuery) {
		XCTAssert(webViewsQuery/*@START_MENU_TOKEN@*/.otherElements["paper News, tab panel"]/*[[".otherElements[\"The Shakerite\"].otherElements[\"paper News, tab panel\"]",".otherElements[\"paper News, tab panel\"]"],[[[-1,1],[-1,0]]],[0]]@END_MENU_TOKEN@*/
			.children(matching: .other).element
			.children(matching: .other).element(boundBy: 1)
			.children(matching: .other).element(boundBy: 1)
			.waitForExistence(timeout: 10))
	}
	
	private func openFirstArticle(webViewsQuery: XCUIElementQuery) {
		webViewsQuery/*@START_MENU_TOKEN@*/.otherElements["paper News, tab panel"]/*[[".otherElements[\"The Shakerite\"].otherElements[\"paper News, tab panel\"]",".otherElements[\"paper News, tab panel\"]"],[[[-1,1],[-1,0]]],[0]]@END_MENU_TOKEN@*/
			.children(matching: .other).element
			.children(matching: .other).element(boundBy: 1)
			.children(matching: .other).element(boundBy: 1)
			.children(matching: .image).element.tap()
		webViewsQuery/*@START_MENU_TOKEN@*/.otherElements["paper News, tab panel"]/*[[".otherElements[\"The Shakerite\"].otherElements[\"paper News, tab panel\"]",".otherElements[\"paper News, tab panel\"]"],[[[-1,1],[-1,0]]],[0]]@END_MENU_TOKEN@*/
			.children(matching: .other).element
			.children(matching: .other).element(boundBy: 1)
			.children(matching: .other).element(boundBy: 4)
			.children(matching: .staticText).element
			.waitForExistence(timeout: 5)
	}
	
	func testArticles() {
		let webViewsQuery = XCUIApplication().webViews
		waitArticles(webViewsQuery: webViewsQuery)
		snapshot("01Home")
		openFirstArticle(webViewsQuery: webViewsQuery)
		snapshot("02Article")
		webViewsQuery/*@START_MENU_TOKEN@*/.otherElements["paper News, tab panel"]/*[[".otherElements[\"The Shakerite\"].otherElements[\"paper News, tab panel\"]",".otherElements[\"paper News, tab panel\"]"],[[[-1,1],[-1,0]]],[0]]@END_MENU_TOKEN@*/
			.children(matching: .other).element
			.children(matching: .button).element(boundBy: 2)
			.tap()
		snapshot("03Fonts")
	}
	
	func testSaved() {
		let webViewsQuery = XCUIApplication().webViews
		waitArticles(webViewsQuery: webViewsQuery)
		openFirstArticle(webViewsQuery: webViewsQuery)
		webViewsQuery/*@START_MENU_TOKEN@*/.otherElements["paper News, tab panel"]/*[[".otherElements[\"The Shakerite\"].otherElements[\"paper News, tab panel\"]",".otherElements[\"paper News, tab panel\"]"],[[[-1,1],[-1,0]]],[0]]@END_MENU_TOKEN@*/
			.children(matching: .other).element
			.children(matching: .button).element(boundBy: 1)
			.tap()
		webViewsQuery/*@START_MENU_TOKEN@*/.buttons["Saved"]/*[[".otherElements[\"The Shakerite\"].buttons[\"Saved\"]",".buttons[\"Saved\"]"],[[[-1,1],[-1,0]]],[0]]@END_MENU_TOKEN@*/.tap()
		snapshot("04Saved")
	}
	
	func testSocial() {
		let webViewsQuery = XCUIApplication().webViews
		webViewsQuery/*@START_MENU_TOKEN@*/.buttons["settings Settings"]/*[[".otherElements[\"The Shakerite\"].buttons[\"settings Settings\"]",".buttons[\"settings Settings\"]"],[[[-1,1],[-1,0]]],[0]]@END_MENU_TOKEN@*/.tap()
		snapshot("05Social")
	}
}
