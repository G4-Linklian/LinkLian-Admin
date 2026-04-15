import React, { useState } from 'react'
import Breadcrumb from "@/comps/breadCrumb/breadCrumb";
import { Group, Tabs, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconAlertCircle, IconCircleCheck, IconSearch } from '@tabler/icons-react';
import TableSection from '../shared/TableSection';
// import InstitutionTable from './institution/institutionTable';
import ReportTable from '@/comps/report/report/reportTable';
import ReportResolvedTable from '@/comps/report/report/reportReSolvedTable';


const ReportComp = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 500);
    const [resolvedRefreshKey, setResolvedRefreshKey] = useState(0);

    return (
        <div className='info-comp pb-8'>
            <Breadcrumb
                items={[
                    { label: "รายการคำขอ" },
                ]}
            />
            <div className="w-full h-[95%] mt-4 text-black">
                <div className="header-section">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">รายการคำขอ</h2>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <Tabs defaultValue="pending" variant="pills" radius="lg" color="blue">
                        <div className="flex items-center justify-between gap-2">
                            <Tabs.List className="p-1 rounded-xl">
                                <Tabs.Tab
                                    value="pending"
                                    leftSection={<IconAlertCircle />}
                                    className="hover:bg-white transition-colors"
                                >
                                    ยังไม่แก้ไข
                                </Tabs.Tab>
                                <Tabs.Tab
                                    value="resolved"
                                    color="teal"
                                    leftSection={<IconCircleCheck />}
                                    className="hover:bg-white transition-colors"
                                >
                                    แก้ไขแล้ว
                                </Tabs.Tab>
                            </Tabs.List>

                            <Group gap="xs">
                                <TextInput
                                    placeholder="ค้นหาหัวข้อ/รายละเอียด"
                                    size="xs"
                                    radius="md"
                                    leftSection={<IconSearch size={14} />}
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.currentTarget.value)}
                                />
                            </Group>
                        </div>

                        <Tabs.Panel value="pending" pt="sm">
                            <ReportTable
                                searchTerm={debouncedSearchTerm}
                                onResolved={() => setResolvedRefreshKey((prev) => prev + 1)}
                            />
                        </Tabs.Panel>

                        <Tabs.Panel value="resolved" pt="sm">
                            <ReportResolvedTable
                                searchTerm={debouncedSearchTerm}
                                refreshKey={resolvedRefreshKey}
                            />
                        </Tabs.Panel>
                    </Tabs>
                </div>

            </div>
        </div>
    )
}

export default ReportComp
