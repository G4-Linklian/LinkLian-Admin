import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Head from 'next/head';
import React from 'react'

import LayoutShellManagement from "@/comps/layouts/LayoutShellManagement";
import ThemeComp from "@/comps/theme-settings/themeComp";

function PageContent() {

    const router = useRouter();

    return (
        <div className="w-full h-full text-black px-8 py-4 bg-[#FAFAFA]">
            <ThemeComp />
        </div>
    );
}


export default function ThemeSettings() {
    return (
        <>
            <Head>
                <title>ตั้งค่าธีม</title>
                <meta name="description" content="Information Page" />
            </Head>

            <LayoutShellManagement>
                <PageContent></PageContent>
            </LayoutShellManagement>
        </>
    );
}

