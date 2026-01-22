import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

type TablePayload = {
  type: 'TABLE';
  columns: string[];
  rows: (string | number | null)[][];
};

type Props = {
  payload: TablePayload;
};

const CELL_WIDTH = 120;
const MAX_TABLE_HEIGHT = 260;

/* ================= UTILS ================= */
const formatCell = (value: string | number | null) => {
  if (value === null || value === undefined) return '-';

  // Format ISO date → YYYY-MM-DD
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  // Format decimals (hours)
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
  }

  return value.toString();
};

/* ================= COMPONENT ================= */
const TableMessage: React.FC<Props> = ({ payload }) => {
  const { columns, rows } = payload;

  if (!columns?.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No data returned</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* Horizontal Scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator nestedScrollEnabled>
        <View>
          {/* HEADER */}
          <View style={styles.headerRow}>
            {columns.map((col, idx) => (
              <View key={idx} style={[styles.cell, styles.headerCell]}>
                <Text style={styles.headerText} numberOfLines={1}>
                  {col}
                </Text>
              </View>
            ))}
          </View>

          {/* BODY */}
          <ScrollView
            style={{ maxHeight: MAX_TABLE_HEIGHT }}
            showsVerticalScrollIndicator
            nestedScrollEnabled
          >
            {rows.map((row, rIdx) => (
              <View key={rIdx} style={styles.row}>
                {row.map((cell, cIdx) => (
                  <View key={cIdx} style={styles.cell}>
                    <Text style={styles.cellText} numberOfLines={2}>
                      {formatCell(cell)}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

export default TableMessage;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },

  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
  },

  row: {
    flexDirection: 'row',
  },

  cell: {
    width: CELL_WIDTH,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
  },

  headerCell: {
    borderBottomWidth: 2,
  },

  headerText: {
    fontWeight: '700',
    fontSize: 13,
    color: '#111827',
  },

  cellText: {
    fontSize: 13,
    color: '#111827',
  },

  empty: {
    padding: 12,
  },

  emptyText: {
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
