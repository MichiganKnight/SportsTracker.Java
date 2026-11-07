package com.sportstracker.integrations.espn.mappers;

import com.sportstracker.enums.GameStatus;
import com.sportstracker.enums.League;

import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class GameResultFormatter {
    private static final Pattern OVERTIME_COUNT = Pattern.compile("(?<!\\w)(\\d+)(?:st|nd|rd|th)?\\s*OT\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern OVERTIME = Pattern.compile("\\b(OT|Overtime)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern SHOOTOUT = Pattern.compile("\\b(SO|Shootout)\\b", Pattern.CASE_INSENSITIVE);

    private GameResultFormatter() {

    }

    public static String getLabel(League league, boolean completed, int period, String name, String shortDetail, String description, String detail, int homeScore, int awayScore) {
        if (!completed) {
            return null;
        }

        String text = String.join(" ", safe(name), safe(shortDetail), safe(description), safe(detail));

        if (league == League.NFL && homeScore == awayScore) {
            return "FINAL / TIE";
        }

        if (league == League.NFL || league == League.CFB) {
            Matcher matcher = OVERTIME_COUNT.matcher(text);

            if (matcher.find()) {
                int count = Integer.parseInt(matcher.group(1));

                if (count > 0) {
                    return count == 1 ? "FINAL / OT" : "FINAL / " + count + "OT";
                }
            }

            if (period > 4) {
                int count = period - 4;

                return count == 1 ? "FINAL / OT" : "FINAL / " + count + "OT";
            }

            if (OVERTIME.matcher(text).find()) {
                return "FINAL / OT";
            }
        }

        if (league == League.NHL) {
            if (SHOOTOUT.matcher(text).find() || "STATUS_FINAL_SHOOTOUT".equalsIgnoreCase(name)) {
                return "FINAL / SO";
            }

            if (period > 3) {
                int count = period - 3;

                return count == 1 ? "FINAL / OT" : "FINAL / " + count + "OT";
            }
        }

        if (league == League.MLB && period > 9) {
            return "FINAL / " + period;
        }

        return "FINAL";
    }

    public static GameStatus getStatus(String name, String resultLabel) {
        if (resultLabel != null) {
            if ("FINAL / SO".equals(resultLabel)) {
                return GameStatus.FINAL_SHOOTOUT;
            }

            if (resultLabel.toUpperCase(Locale.ROOT).contains("OT")) {
                return GameStatus.FINAL_OVERTIME;
            }

            return GameStatus.FINAL;
        }

        if (name == null) {
            return GameStatus.SCHEDULED;
        }

        return switch (name.toUpperCase(Locale.ROOT)) {
            case "STATUS_SCHEDULED" -> GameStatus.SCHEDULED;
            case "STATUS_PREGAME" -> GameStatus.PREGAME;
            case "STATUS_IN_PROGRESS" -> GameStatus.IN_PROGRESS;
            case "STATUS_HALFTIME" -> GameStatus.HALFTIME;

            case "STATUS_FINAL" -> GameStatus.FINAL;
            case "STATUS_FINAL_OVERTIME" -> GameStatus.FINAL_OVERTIME;
            case "STATUS_FINAL_SHOOTOUT" -> GameStatus.FINAL_SHOOTOUT;

            case "STATUS_POSTPONED" -> GameStatus.POSTPONED;
            case "STATUS_DELAYED" -> GameStatus.DELAYED;
            case "STATUS_SUSPENDED" -> GameStatus.SUSPENDED;
            case "STATUS_CANCELLED", "STATUS_CANCELED" -> GameStatus.CANCELLED;

            default -> GameStatus.SCHEDULED;
        };
    }

    private static String safe(String value) {
        return value == null ? "" : value;
    }
}
