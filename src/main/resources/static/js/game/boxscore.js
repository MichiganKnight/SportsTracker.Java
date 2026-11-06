document.addEventListener("DOMContentLoaded", () => {
    initializeBoxScoreSorting();
});

function initializeBoxScoreSorting() {
    const tables = document.querySelectorAll("[data-boxscore-table]");

    tables.forEach(table => {
        const rows = table.querySelectorAll("[data-boxscore-player-row]");

        rows.forEach((row, index) => {
            row.dataset.originalIndex = index;
        });

        const headers = table.querySelectorAll("[data-sort-column]");

        headers.forEach(header => {
            header.addEventListener("click", () => {
                sortBoxScoreTable(table, header);
            });
        });
    });
}

function sortBoxScoreTable(table, header) {
    const columnIndex = Number.parseInt(header.dataset.sortColumn, 10);

    const sortType = header.dataset.sortType ?? "text";

    const currentDirection = header.dataset.sortDirection ?? "none";

    let nextDirection;
    
    switch (currentDirection) {
        case "none":
            nextDirection = "desc";
            break;
        
        case "desc":
            nextDirection = "asc";
            break;
            
        default:
            nextDirection = "none";
            break;
    }

    resetSortHeaders(table);

    header.dataset.sortDirection = nextDirection;

    updateSortIcon(header, nextDirection);

    const tbody = table.querySelector("tbody");

    if (!tbody) {
        return;
    }

    const rows = Array.from(
        tbody.querySelectorAll("[data-boxscore-player-row]")
    );
    
    if (nextDirection === "none") {
        rows.sort((a, b) => {
            const indexA = Number.parseInt(a.dataset.originalIndex, 10);
            const indexB = Number.parseInt(b.dataset.originalIndex, 10);
            
            return indexA - indexB;
        });
    } else {
        rows.sort((a, b) => {
            const valueA = getSortValue(a, columnIndex, sortType);
            const valueB = getSortValue(b, columnIndex, sortType);
            
            return compareValues(valueA, valueB, nextDirection);
        });
    }

    const totalsRow = tbody.querySelector(".boxscore-totals-row");

    rows.forEach(row => {
        if (totalsRow) {
            tbody.insertBefore(row, totalsRow);
        } else {
            tbody.appendChild(row);
        }
    });
}

function getSortValue(row, columnIndex, sortType) {
    if (columnIndex === -1) {
        const playerName = row.querySelector(".boxscore-player-name");

        return playerName?.textContent.trim().toLowerCase() ?? "";
    }

    const cells = row.querySelectorAll("td");

    const cell = cells[columnIndex + 1];

    const rawValue = cell?.textContent.trim() ?? "";

    return parseSortValue(rawValue, sortType);
}

function parseSortValue(value, sortType) {
    if (!value) {
        return Number.NEGATIVE_INFINITY;
    }

    switch (sortType) {
        case "decimal":
            return parseDecimal(value);

        case "compound":
            return parseCompound(value);

        case "innings":
            return parseInnings(value);

        case "number":
            return parseNumber(value);

        default:
            return value.toLowerCase();
    }
}

function parseNumber(value) {
    const number = Number.parseFloat(value);

    return Number.isNaN(number) ? Number.NEGATIVE_INFINITY : number;
}

function parseDecimal(value) {
    return parseNumber(value);
}

function parseCompound(value) {
    const separator = value.includes("/") ? "/" : value.includes("-") ? "-" : null;

    if (!separator) {
        return parseNumber(value);
    }
    
    const parts = value.split(separator);

    if (parts.length !== 2) {
        return parseNumber(value);
    }

    const first = Number.parseFloat(parts[0]);

    const second = Number.parseFloat(parts[1]);

    if (Number.isNaN(first) || Number.isNaN(second) || second === 0) {
        return Number.NEGATIVE_INFINITY;
    }

    return first / second;
}

function parseInnings(value) {
    const parts = value.split(".");

    const innings = Number.parseInt(parts[0], 10);

    const outs = parts.length > 1 ? Number.parseInt(parts[1], 10) : 0;

    if (Number.isNaN(innings)) {
        return Number.NEGATIVE_INFINITY;
    }

    return innings + (outs / 3);
}

function compareValues(valueA, valueB, direction) {
    let result;

    if (typeof valueA === "string" || typeof valueB === "string") {
        result = String(valueA).localeCompare(String(valueB));
    } else {
        result = valueA - valueB;
    }

    return direction === "asc" ? result : -result;
}

function resetSortHeaders(table) {
    const headers = table.querySelectorAll("[data-sort-column]");

    headers.forEach(header => {
        header.dataset.sortDirection = "none";

        const icon = header.querySelector(".boxscore-sort-icon");

        if (icon) {
            icon.className = "bi bi-arrow-down-up boxscore-sort-icon";
        }
    });
}

function updateSortIcon(header, direction) {
    const icon = header.querySelector(".boxscore-sort-icon");

    if (!icon) {
        return;
    }
    
    switch (direction) {
        case "asc":
            icon.className = "bi bi-sort-up boxscore-sort-icon";
            break;
            
        case "desc":
            icon.className = "bi bi-sort-down boxscore-sort-icon";
            break;
            
        default:
            icon.className = "bi bi-arrow-down-up boxscore-sort-icon";
            break;
    }
}