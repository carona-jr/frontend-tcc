import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import ReactHtmlParses from 'react-html-parser'

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
        padding: 10
    },
    clauses: {
        padding: 6
    },
    signers: {
        fontSize: 12,
        margin: 10,
        padding: 10,
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    signer: {
        borderTop: '1px solid black',
        width: '45%',
        marginTop: '24px'
    },
    signerInfo: {
        paddingVertical: '2px',
        fontSize: '8px'
    },
    signerName: {
        paddingVertical: '1px',
        fontSize: '12px'
    }
})

// Create Document Component
export default function ContractPDF({ contract, clauses, order, signers }) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.title}>
                    <Text>{contract.title}</Text>
                </View>
                <View style={styles.section}>
                    {order.map(_id => (
                        <Text key={_id}>{ReactHtmlParses(clauses[_id].content)}</Text>
                    ))}
                </View>
                <View style={styles.signers}>
                    {signers.map(s => (
                        <View key={s._id} style={styles.signer}>
                            <Text style={styles.signerName}>{s.name}</Text>
                            <Text style={styles.signerInfo}>E-mail: {s.email}</Text>
                            <Text style={styles.signerInfo}>Documento: {s.document}</Text>
                        </View>
                    ))}
                </View>
            </Page>
        </Document>
    )
}