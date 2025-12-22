import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
    lineHeight: 1.6,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  label: {
    backgroundColor: '#e5e7eb',
    padding: '4 12',
    borderRadius: 4,
    fontSize: 10,
    color: '#374151',
  },
  content: {
    fontSize: 12,
    lineHeight: 1.6,
  },
  h1: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  h2: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 14,
    marginBottom: 10,
  },
  h3: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 8,
  },
  listItem: {
    marginLeft: 20,
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#6b7280',
  },
});

interface RecipePDFDocumentProps {
  recipe: {
    title: string;
    content: string;
    labels: string[];
  };
}

// Simple markdown parser for PDF
function parseMarkdownContent(content: string) {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];

  lines.forEach((line, index) => {
    // Skip empty lines
    if (line.trim() === '') {
      elements.push(<Text key={`empty-${index}`} style={{ marginBottom: 4 }}>{' '}</Text>);
      return;
    }

    // H1 - # Heading
    if (line.startsWith('# ')) {
      elements.push(
        <Text key={index} style={styles.h1}>
          {line.slice(2)}
        </Text>
      );
      return;
    }

    // H2 - ## Heading
    if (line.startsWith('## ')) {
      elements.push(
        <Text key={index} style={styles.h2}>
          {line.slice(3)}
        </Text>
      );
      return;
    }

    // H3 - ### Heading
    if (line.startsWith('### ')) {
      elements.push(
        <Text key={index} style={styles.h3}>
          {line.slice(4)}
        </Text>
      );
      return;
    }

    // Unordered list - * item or - item
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      elements.push(
        <Text key={index} style={styles.listItem}>
          • {line.trim().slice(2)}
        </Text>
      );
      return;
    }

    // Ordered list - 1. item
    if (/^\d+\.\s/.test(line.trim())) {
      elements.push(
        <Text key={index} style={styles.listItem}>
          {line.trim()}
        </Text>
      );
      return;
    }

    // Regular paragraph - strip basic markdown (bold, italic)
    let cleanedLine = line;

    // Remove bold markers (** or __)
    cleanedLine = cleanedLine.replace(/\*\*(.*?)\*\*/g, '$1');
    cleanedLine = cleanedLine.replace(/__(.*?)__/g, '$1');

    // Remove italic markers (* or _)
    cleanedLine = cleanedLine.replace(/\*(.*?)\*/g, '$1');
    cleanedLine = cleanedLine.replace(/_(.*?)_/g, '$1');

    // Remove inline code markers (`)
    cleanedLine = cleanedLine.replace(/`(.*?)`/g, '$1');

    elements.push(
      <Text key={index} style={styles.paragraph}>
        {cleanedLine}
      </Text>
    );
  });

  return elements;
}

export function RecipePDFDocument({ recipe }: RecipePDFDocumentProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <Text style={styles.title}>{recipe.title}</Text>

        {/* Labels */}
        {recipe.labels.length > 0 && (
          <View style={styles.labelsContainer}>
            {recipe.labels.map((label, i) => (
              <Text key={i} style={styles.label}>
                {label}
              </Text>
            ))}
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {parseMarkdownContent(recipe.content)}
        </View>

        {/* Footer */}
        <Text style={styles.footer} fixed>
          Generated from Meju • {currentDate}
        </Text>
      </Page>
    </Document>
  );
}