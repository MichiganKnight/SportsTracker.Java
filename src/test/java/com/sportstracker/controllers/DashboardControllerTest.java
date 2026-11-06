package com.sportstracker.controllers;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.ui.ExtendedModelMap;
import org.springframework.ui.Model;

public class DashboardControllerTest {
    private final DashboardController dashboardController = new DashboardController();

    @Test
    public void indexShouldReturnDashboardView() {
        Model model = new ExtendedModelMap();

        String result = dashboardController.index(model);

        Assertions.assertEquals("dashboard/index", result);
    }

    @Test
    public void indexShouldSetPageTitle() {
        Model model = new ExtendedModelMap();

        dashboardController.index(model);

        Assertions.assertEquals("Dashboard", model.getAttribute("pageTitle"));
    }

    @Test
    public void indexShouldSetHeading() {
        Model model = new ExtendedModelMap();

        dashboardController.index(model);

        Assertions.assertEquals("SportsTracker Dashboard", model.getAttribute("heading"));
    }
}
