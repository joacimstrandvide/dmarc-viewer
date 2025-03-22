'use client'

import { useState } from 'react'
import { XMLParser } from 'fast-xml-parser'
import { useDropzone } from 'react-dropzone'

interface DMARCReport {
    // Define the structure & type
    report_metadata?: {
        org_name?: string
        email?: string
        report_id?: string
        date_range?: { begin?: number; end?: number }
    }
    policy_published?: {
        domain?: string
        adkim?: string
        aspf?: string
        p?: string
        sp?: string
        pct?: number
        fo?: string
    }
    record?: Array<{
        row?: {
            source_ip?: string
            count?: number
            policy_evaluated?: {
                disposition?: string
                dkim?: string
                spf?: string
            }
        }
        identifiers?: {
            envelope_to?: string
            envelope_from?: string
            header_from?: string
        }
        auth_results?: {
            dkim?: Array<{
                domain?: string
                selector?: string
                result?: string
            }>
            spf?: {
                domain?: string
                scope?: string
                result?: string
            }
        }
    }>
}

export default function Data() {
    const [parsedData, setParsedData] = useState<DMARCReport | null>(null)

    const onDrop = (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        const reader = new FileReader()

        reader.onload = (event: ProgressEvent<FileReader>) => {
            if (!event.target?.result) return
            const xmlData = event.target.result as string
            const parser = new XMLParser({
                ignoreAttributes: false,
                ignoreDeclaration: true
            })

            // Parse the XML to JSON
            const jsonData = parser.parse(xmlData)

            const feedback = jsonData.feedback || jsonData

            // Make sure it's an array
            if (feedback.record && !Array.isArray(feedback.record)) {
                feedback.record = [feedback.record]
            }

            setParsedData(feedback)
        }

        reader.readAsText(file)
    }

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: { 'application/xml': ['.xml'] }
    })

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white text-white">
            <div
                {...getRootProps()}
                className="w-96 p-6 border-2 border-dashed border-gray-500 bg-black rounded-lg cursor-pointer text-center"
            >
                <input {...getInputProps()} />
                <p>Drop a XML file here, or click to select</p>
            </div>
            {parsedData && (
                <div className="mt-6 w-full max-w-2xl p-6 bg-black shadow-lg rounded-lg">
                    <h2 className="text-xl font-bold mb-4">
                        DMARC Report Summary
                    </h2>
                    <div className="mb-4">
                        <h3 className="font-semibold">Report Metadata</h3>
                        <p>
                            <strong>Organization:</strong>{' '}
                            {parsedData.report_metadata?.org_name}
                        </p>
                        <p>
                            <strong>Email:</strong>{' '}
                            {parsedData.report_metadata?.email}
                        </p>
                        <p>
                            <strong>Report ID:</strong>{' '}
                            {parsedData.report_metadata?.report_id}
                        </p>
                    </div>
                    <div className="mb-4">
                        <h3 className="font-semibold">Policy</h3>
                        <p>
                            <strong>Domain:</strong>{' '}
                            {parsedData.policy_published?.domain}
                        </p>
                        <p>
                            <strong>Policy:</strong>{' '}
                            {parsedData.policy_published?.p}
                        </p>
                        <p>
                            <strong>Subdomain Policy:</strong>{' '}
                            {parsedData.policy_published?.sp}
                        </p>
                        <p>
                            <strong>DKIM Alignment:</strong>{' '}
                            {parsedData.policy_published?.adkim}
                        </p>
                        <p>
                            <strong>SPF Alignment:</strong>{' '}
                            {parsedData.policy_published?.aspf}
                        </p>
                        <p>
                            <strong>Percentage Applied:</strong>{' '}
                            {parsedData.policy_published?.pct}%
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Records</h3>
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-800">
                                    <th className="border border-gray-300 p-2">
                                        Source IP
                                    </th>
                                    <th className="border border-gray-300 p-2">
                                        Count
                                    </th>
                                    <th className="border border-gray-300 p-2">
                                        Disposition
                                    </th>
                                    <th className="border border-gray-300 p-2">
                                        SPF
                                    </th>
                                    <th className="border border-gray-300 p-2">
                                        DKIM
                                    </th>
                                    <th className="border border-gray-300 p-2">
                                        Envelope From
                                    </th>
                                    <th className="border border-gray-300 p-2">
                                        Header From
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {parsedData.record?.map((record, index) => (
                                    <tr
                                        key={index}
                                        className="text-center border border-gray-300"
                                    >
                                        <td className="border border-gray-300 p-2">
                                            {record.row?.source_ip}
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            {record.row?.count}
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            {
                                                record.row?.policy_evaluated
                                                    ?.disposition
                                            }
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            {record.row?.policy_evaluated?.spf}
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            {record.row?.policy_evaluated?.dkim}
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            {record.identifiers?.envelope_from}
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            {record.identifiers?.header_from}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
