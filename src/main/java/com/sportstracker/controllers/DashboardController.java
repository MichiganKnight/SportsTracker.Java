package com.sportstracker.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {
    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("pageTitle", "Dashboard");
        model.addAttribute("heading", "SportsTracker Dashboard");

        return "dashboard/index";
    }
}
