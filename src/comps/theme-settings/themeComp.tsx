import React from 'react'
import Breadcrumb from "@/comps/breadCrumb/breadCrumb";
import ThemeSettingsDashboard from './theme/themeTable';
import TableSection from '../shared/TableSection';

const themeComp = () => {

    return (
        <div className='info-comp pb-8'>
            <Breadcrumb
                items={[
                    { label: "ตั้งค่าธีม" },
                ]}
            />
            <div className="w-full h-[95%] mt-4 text-black">
                <div className="header-section">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">ตั้งค่าธีม</h2>
                </div>

                <TableSection>
                    <ThemeSettingsDashboard />
                </TableSection>
                
            </div>
        </div>
    )
}

export default themeComp
