package com.sportstracker.enums;

public enum GameStatus {
    SCHEDULED,
    PREGAME,

    IN_PROGRESS,
    HALFTIME,

    FINAL,
    FINAL_OVERTIME,
    FINAL_SHOOTOUT,

    DELAYED,
    POSTPONED,
    SUSPENDED,
    CANCELLED;

    public boolean isUpcoming() {
        return this == SCHEDULED || this == PREGAME;
    }

    public boolean isLive() {
        return this == IN_PROGRESS || this == HALFTIME;
    }

    public boolean isFinal() {
        return this == FINAL || this == FINAL_OVERTIME || this == FINAL_SHOOTOUT;
    }

    public boolean isDelayed() {
        return this == DELAYED || this == POSTPONED || this == SUSPENDED;
    }

    public boolean isCancelled() {
        return this == CANCELLED;
    }
}
