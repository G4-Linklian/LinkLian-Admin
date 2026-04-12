import {
    Modal,
    Button,
    Group,
    TextInput,
    Tabs,
    Switch,
    Text,
} from "@mantine/core";
import { IconUpload, IconEye } from '@tabler/icons-react';
import { useForm } from "@mantine/form";
import { themeSettingsFields } from "@/utils/interface/themeSettings.types";
import { useState, useEffect } from "react";
import UploadTab from "./UploadTab";
import PreviewTab, { generateCroppedThemeImage } from "./PreviewTab";
import { DateInput } from "@mantine/dates";

interface EditThemeModalProps {
    opened: boolean;
    close: () => void;
    theme: themeSettingsFields | null;
    onSubmit?: (values: themeSettingsFields) => void;
    token?: any;
}

export default function EditThemeModal({
    opened,
    close,
    theme,
    onSubmit,
    token
}: EditThemeModalProps) {
    const [activeTab, setActiveTab] = useState<string | null>('upload');
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    const [imageZoom, setImageZoom] = useState(1);
    const [originalImageUrl, setOriginalImageUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageError, setImageError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        initialValues: {
            theme_id: 0,
            theme_name: "",
            theme_url: "",
            start_date: null as Date | null,
            end_date: null as Date | null,
            is_default: false,
        },
    });

    useEffect(() => {
        if (opened && theme) {
            const sourceImageUrl = theme.theme_url || "";
            form.setValues({
                theme_id: theme.theme_id || 0,
                theme_name: theme.theme_name || "",
                theme_url: sourceImageUrl,
                start_date: theme.start_date ? new Date(theme.start_date) : null,
                end_date: theme.end_date ? new Date(theme.end_date) : null,
                is_default: theme.is_default || false,
            });
            setOriginalImageUrl(sourceImageUrl);
            setSelectedFile(null);
            setImagePosition({ x: 0, y: 0 });
            setImageZoom(1);
        }
    }, [opened, theme]);

    const dataUrlToFile = (dataUrl: string, fileName: string) => {
        const [meta, base64Data] = dataUrl.split(',');
        const mimeMatch = meta.match(/data:(.*?);base64/);
        const mime = mimeMatch?.[1] || 'image/png';
        const byteChars = atob(base64Data || '');
        const byteNumbers = new Array(byteChars.length);

        for (let i = 0; i < byteChars.length; i += 1) {
            byteNumbers[i] = byteChars.charCodeAt(i);
        }

        return new File([new Uint8Array(byteNumbers)], fileName, { type: mime });
    };

    const handleDefaultChange = (checked: boolean) => {
        form.setFieldValue('is_default', checked);
        if (checked) {
            form.setFieldValue('start_date', null);
            form.setFieldValue('end_date', null);
            form.clearFieldError('start_date');
            form.clearFieldError('end_date');
        }
    };

    const handleImageChange = (url: string, file?: File) => {
        setOriginalImageUrl(url);
        setSelectedFile(file || null);
        setImageError('');
        form.setFieldValue('theme_url', url);
        if (url) {
            setImagePosition({ x: 0, y: 0 });
            setImageZoom(1);
        }
    };

    const handleCroppedImageChange = (croppedUrl: string) => {
        form.setFieldValue('theme_url', croppedUrl);
    };

    const handleSubmit = async (values: typeof form.values) => {
        if (isSubmitting) return;

        const hasAdjustedImage = imageZoom !== 1 || imagePosition.x !== 0 || imagePosition.y !== 0;

        if (hasAdjustedImage && !selectedFile) {
            setImageError('หากต้องการปรับรูปภาพ กรุณาอัปโหลดไฟล์ใหม่ก่อนบันทึก');
            setActiveTab('upload');
            return;
        }

        setIsSubmitting(true);
        try {
            const croppedThemeUrl = hasAdjustedImage && originalImageUrl
                ? await generateCroppedThemeImage(originalImageUrl, imagePosition, imageZoom)
                : values.theme_url;

            const finalFile = hasAdjustedImage && croppedThemeUrl && selectedFile
                ? dataUrlToFile(croppedThemeUrl, selectedFile.name || 'theme.png')
                : selectedFile || undefined;

            console.log("submit edit values:", values);
            await onSubmit?.({
                ...values,
                theme_url: croppedThemeUrl,
                file: finalFile,
                start_date: values.is_default ? null : values.start_date || undefined,
                end_date: values.is_default ? null : values.end_date || undefined,
            });
            handleClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        form.reset();
        setOriginalImageUrl('');
        setSelectedFile(null);
        setImageError('');
        setImagePosition({ x: 0, y: 0 });
        setImageZoom(1);
        setActiveTab('upload');
        close();
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            centered
            size="lg"
            padding={24}
            radius={16}
        >
            <h1 className="color-black font-bold text-2xl mb-4 text-center">แก้ไขธีม</h1>
            <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col">
                <TextInput
                    label="ชื่อธีม"
                    placeholder="กรอกชื่อธีม"
                    {...form.getInputProps("theme_name")}
                    radius={8}
                    required
                />
                <Switch
                    label="ตั้งค่าเป็นธีมเริ่มต้น"
                    description="ธีมนี้จะถูกตั้งเป็นธีมเริ่มต้นใหม่แทนธีมเริ่มต้นเดิม และจะไม่ต้องระบุช่วงวันที่"
                    checked={form.values.is_default}
                    onChange={(e) => handleDefaultChange(e.currentTarget.checked)}
                    radius="md"
                    size="sm"
                    color="blue"
                />

                <Group grow>
                    <DateInput
                        id="input-start-date"
                        label="วันที่เริ่มต้น"
                        valueFormat="DD/MM/YYYY"
                        placeholder="เช่น 01/01/2567"
                        {...form.getInputProps("start_date")}
                        required={!form.values.is_default}
                        disabled={form.values.is_default}
                        radius={8}
                    />

                    <DateInput
                        id="input-end-date"
                        label="วันที่สิ้นสุด"
                        valueFormat="DD/MM/YYYY"
                        placeholder="เช่น 30/04/2567"
                        {...form.getInputProps("end_date")}
                        required={!form.values.is_default}
                        disabled={form.values.is_default}
                        radius={8}
                    />
                </Group>

                <Tabs value={activeTab} onChange={setActiveTab} mt="md">
                    <Tabs.List grow>
                        <Tabs.Tab value="upload" leftSection={<IconUpload size={16} />}>
                            อัปโหลดรูป
                        </Tabs.Tab>
                        <Tabs.Tab value="preview" leftSection={<IconEye size={16} />}>
                            ตัวอย่าง
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="upload" pt="md">
                        <UploadTab
                            imageUrl={originalImageUrl}
                            onImageChange={handleImageChange}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="preview" pt="md">
                        <PreviewTab
                            imageUrl={originalImageUrl}
                            position={imagePosition}
                            zoom={imageZoom}
                            onPositionChange={setImagePosition}
                            onZoomChange={setImageZoom}
                            onCroppedImageChange={handleCroppedImageChange}
                        />
                    </Tabs.Panel>
                </Tabs>

                {imageError && (
                    <Text size="sm" c="red" mt={4}>
                        {imageError}
                    </Text>
                )}

                <Group justify="flex-end" className="mt-8">
                    <Button color="blue" variant="outline" onClick={handleClose} radius={8}>
                        ยกเลิก
                    </Button>

                    <Button type="submit" radius={8} disabled={isSubmitting} loading={isSubmitting}>
                        บันทึก
                    </Button>
                </Group>
            </form>
        </Modal>
    );
}
