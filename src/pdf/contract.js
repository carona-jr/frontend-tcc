import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#fff'
    },
    title: {
        padding: 16,
        textAlign: 'center'
    },
    section: {
        fontSize: 12,
        margin: 10,
        padding: 10,
        flexGrow: 1
    },
    clauses: {
        padding: 6
    }
})

// Create Document Component
export default function ContractPDF({ contract, clauses, order }) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.title}>
                    <Text>{contract.title}</Text>
                </View>
                <View style={styles.section}>
                    {order.map(_id => (
                        <Text key={_id} style={styles.clauses}>{clauses[_id].content}</Text>
                    ))}
                </View>
            </Page>
        </Document>
    )
}