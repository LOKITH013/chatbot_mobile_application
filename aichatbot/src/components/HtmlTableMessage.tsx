import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

type TablePayload = {
  type: 'TABLE';
  columns: string[];
  rows: (string | number | null)[][];
};

type Props = {
  payload: TablePayload;
};

const HtmlTableMessage: React.FC<Props> = ({ payload }) => {
  const { columns, rows } = payload;

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  html, body {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;   /* 🔑 disables body scroll */
    font-family: system-ui;
  }

  .table-container {
    height: 260px;
    width: 100%;
    overflow-y: auto;
    overflow-x: auto;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    -webkit-overflow-scrolling: touch;
  }

  table {
    border-collapse: collapse;
    min-width: 100%;
    width: max-content;
    font-size: 13px;
  }

  thead th {
    position: sticky;
    top: 0;
    background: #F3F4F6;
    z-index: 10;
  }

  th, td {
    padding: 8px 10px;
    border: 1px solid #E5E7EB;
    white-space: nowrap;
    text-align: left;
  }

  tbody tr:nth-child(even) {
    background: #FAFAFA;
  }
</style>
</head>
<body>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          ${columns.map(c => `<th>${c}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${
          rows.length
            ? rows
                .map(
                  r => `
              <tr>
                ${r.map(c => `<td>${c ?? '-'}</td>`).join('')}
              </tr>`,
                )
                .join('')
            : `<tr><td colspan="${columns.length}">No data</td></tr>`
        }
      </tbody>
    </table>
  </div>
</body>
</html>
`;

  return (
    <View style={styles.wrapper}>
      <WebView
        source={{ html }}
        originWhitelist={['*']}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
        showsHorizontalScrollIndicator={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        bounces={false}
        style={styles.webview}
      />
    </View>
  );
};

export default HtmlTableMessage;

const styles = StyleSheet.create({
  wrapper: {
    height: 280, // 🔴 MUST be smaller than table content
    marginVertical: 8,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
