function htmlTable2Arrays() {
    var tables = document.getElementsByTagName('table');
    var results = [];
    for (var t = 0; t < tables.length; t++) {
        var table = tables[t];
        var rows = table.rows;
        var ranges = [];
        var outrows = [];
        for (var rcount = 0; rcount < rows.length; rcount++) {
            outrows.push([]);
        }
        var cursor = creatCursor(outrows);
        for (var r = 0; r < rows.length; r++) {
            cursor.nextRow();
            var row = rows[r];
            var cells = row.cells;
            for (var c = 0; c < cells.length; c++) {
                if (c !== 0) {
                    cursor.nextCol();
                }
                var cell = cells[c];
                var cellValue = cell.innerText;
                if (cellValue !== "" && cellValue == +cellValue) cellValue = +cellValue;
                var colspan = +cell.getAttribute('colspan') || 1;
                var rowspan = +cell.getAttribute('rowspan') || 1;
                outrows[cursor.r][cursor.c] = cellValue;
                for (var cspan = 1; cspan < colspan; cspan++) {
                    outrows[cursor.r][cursor.c + cspan] = null;
                }
                for (var rspan = 1; rspan < rowspan; rspan++) {
                    for (var cs = 0; cs < colspan; cs++) {
                        outrows[cursor.r + rspan][cursor.c + cs] = null;
                    }
                }
                ranges.push({ s: { r: cursor.r, c: cursor.c }, e: { r: cursor.r + rowspan - 1, c: cursor.c + colspan - 1 } });
            }
        }
        results.push({ data: outrows, ranges: ranges });
    }
    return results;
}

function creatCursor(array) {
    return {
        c: -1,
        r: -1,
        nextCol: function () {
            do {
                this.c++;
            } while ('undefined' != (typeof array[this.r][this.c]));
        },
        nextRow: function () {
            this.r += 1;
            this.c = -1;
            this.nextCol();
        }
    };
}

function creatSheet(result) {
    var data = result.data;
    var ranges = result.ranges;
    var worksheet = {};
    var range = { s: { c: 0, r: 0 }, e: { c: 0, r: data.length - 1 } };
    for (var r = 0; r < data.length; r++) {
        if (range.e.c < data[r].length - 1) range.e.c = data[r].length - 1;
        for (var c = 0; c < data[r].length; c++) {
            var cell = { v: data[r][c] };
            if (cell.v !== null) {
                var cell_ref = XLSX.utils.encode_cell({ c: c, r: r });
                switch (typeof cell.v) {
                    case 'number': cell.t = 'n';
                        break;
                    case 'boolean': cell.t = 'b';
                        break;
                    default: cell.t = 's';
                        break;

                }
                worksheet[cell_ref] = cell;
            }
        }
    }
    worksheet['!ref'] = XLSX.utils.encode_range(range);
    worksheet['!merges'] = ranges;
    return worksheet;
}

function fileName() {
    var date = new Date();
    return "" + date.getFullYear() + (((date.getMonth() + 1) < 10) ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1)) + ((date.getDate() < 10) ? ('0' + date.getDate()) : date.getDate()) + ((date.getHours() < 10) ? ('0' + date.getHours()) : date.getHours()) + ((date.getMinutes() < 10) ? ('0' + date.getMinutes()) : date.getMinutes()) + ((date.getSeconds() < 10) ? ('0' + date.getSeconds()) : date.getSeconds()) + '.xlsx';
}


function saveTables() {
    var results = htmlTable2Arrays();
    if(results.length===0){
        alert("Sorry,don't find any table in this page");
        return;
    }
    var workbook = { SheetNames: [], Sheets: {} };
    for (var i = 0; i < results.length; i++) {
        var worksheet = creatSheet(results[i]);
        var worksheetName = 'table' + (i + 1);
        workbook.SheetNames.push(worksheetName);
        workbook.Sheets[worksheetName] = worksheet;
    }
    var workbookOut = XLSX.write(workbook, { bookType: 'xlsx', bookSST: false, type: 'binary' });
    var buf = new ArrayBuffer(workbookOut.length);
    var view = new Uint8Array(buf);
    for (var m = 0; m < workbookOut.length; m++) {
        view[m] = workbookOut.charCodeAt(m) & 0xFF;
    }
    saveAs(new Blob([buf], { type: "application/octet-stream" }), fileName());

}