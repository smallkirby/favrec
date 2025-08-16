'use client';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { Button, Card, Form, Input, message, Tooltip, Typography } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useContext, useEffect, useState } from 'react';
import { FirebaseAuthContext } from '@/lib/firebase/auth';
import { PrettyFirebaseError, recordFav } from '@/lib/firebase/store';
import { FavConfigProvider } from '@/lib/theme';
import type { FavRecord } from '@/types/FavRecord';

const { Title, Text } = Typography;

const validateUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (_e) {
    return false;
  }
};

type FavRecordForm = Omit<FavRecord, 'date' | 'id'>;

export default function Record() {
  const userContext = useContext(FirebaseAuthContext);
  const [messageApi, contextHolder] = message.useMessage();
  const key = 'record';
  const [form] = useForm<FavRecordForm>();
  const [isValidating, setIsValidating] = useState(false);
  const [clipboardUrl, setClipboardUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check clipboard for URL on component mount
  useEffect(() => {
    const checkClipboard = async () => {
      try {
        if (navigator.clipboard?.readText) {
          const text = await navigator.clipboard.readText();
          if (text && validateUrl(text) && !form.getFieldValue('url')) {
            setClipboardUrl(text);
          }
        }
      } catch (e) {
        // Clipboard access denied or not available
      }
    };
    checkClipboard();
  }, [form]);

  const useClipboardUrl = async () => {
    if (clipboardUrl) {
      const user = userContext.user;
      if (user) {
        setIsSubmitting(true);
        messageApi.open({
          key,
          type: 'loading',
          content: 'Recording your fav...',
          duration: 0,
        });

        const res = await recordFav(clipboardUrl);
        if (res instanceof PrettyFirebaseError) {
          messageApi.open({
            key,
            type: 'error',
            content: `Error: ${res.message}`,
          });
        } else {
          messageApi.open({
            key,
            type: 'success',
            content: '🎉 Successfully saved your favorite!',
            duration: 3,
          });
          setClipboardUrl(null);
        }
        setIsSubmitting(false);
      } else {
        messageApi.open({
          key,
          type: 'error',
          content: 'User is not logged in.',
        });
      }
    }
  };

  const onSubmit = async (values: FavRecordForm) => {
    const user = userContext.user;
    if (user) {
      setIsSubmitting(true);
      messageApi.open({
        key,
        type: 'loading',
        content: 'Recording your fav...',
        duration: 0,
      });

      const res = await recordFav(values.url);
      if (res instanceof PrettyFirebaseError) {
        messageApi.open({
          key,
          type: 'error',
          content: `Error: ${res.message}`,
        });
      } else {
        messageApi.open({
          key,
          type: 'success',
          content: '🎉 Successfully saved your favorite!',
          duration: 3,
        });
        form.resetFields();
      }
      setIsSubmitting(false);
    } else {
      messageApi.open({
        key,
        type: 'error',
        content: 'User is not logged in.',
      });
    }
  };

  const validateUrlRealTime = (value: string) => {
    if (!value) return;
    setIsValidating(true);
    // Debounce validation
    const timer = setTimeout(() => {
      setIsValidating(false);
    }, 300);
    return () => clearTimeout(timer);
  };

  return (
    <div className="min-h-[60vh] py-4">
      <FavConfigProvider>
        {contextHolder}

        <div className="mx-auto max-w-2xl">
          {/* Clipboard Suggestion */}
          {clipboardUrl && (
            <Card className="mb-6 border-pink-400/30 bg-pink-900/20 backdrop-blur-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ContentPasteIcon
                    className="text-pink-400 flex-shrink-0"
                    sx={{ width: 20, height: 20 }}
                  />
                  <Text className="text-slate-200 text-sm">
                    URL detected in clipboard
                  </Text>
                </div>
                <a
                  href={clipboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs break-all underline decoration-dotted underline-offset-2 transition-colors duration-200 block"
                >
                  {clipboardUrl}
                </a>
                <Button
                  type="primary"
                  size="large"
                  loading={isSubmitting}
                  onClick={useClipboardUrl}
                  className="w-full bg-pink-500 hover:bg-pink-400 border-none shadow-md hover:shadow-lg 
                    transition-all duration-300 rounded-md h-10 text-base font-medium
                    flex items-center justify-center gap-2 text-white"
                >
                  <ContentPasteIcon sx={{ width: 16, height: 16 }} />
                  Save this URL
                </Button>
              </div>
            </Card>
          )}

          {/* Main Form Card */}
          <Card
            className="border-slate-600/50 bg-gradient-to-br from-slate-800/60 via-slate-800/50 to-slate-900/60 
              backdrop-blur-sm shadow-2xl shadow-slate-900/40"
          >
            <Form
              layout="vertical"
              onFinish={onSubmit}
              form={form}
              size="large"
              className="space-y-4"
            >
              <Form.Item
                name="url"
                label={
                  <span className="text-slate-200 font-medium">
                    Website URL
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: 'Please enter a URL',
                  },
                  () => ({
                    validator(_, value: string | undefined) {
                      if (!!value && validateUrl(value)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error('Please enter a valid URL'),
                      );
                    },
                  }),
                ]}
              >
                <Input
                  placeholder="https://favrec.smallkirby.com"
                  spellCheck={false}
                  allowClear={true}
                  size="large"
                  className="bg-slate-700/50 border-slate-600 hover:border-pink-400 focus:border-pink-400
                    text-slate-100 placeholder:text-slate-400"
                  onChange={(e) => validateUrlRealTime(e.target.value)}
                  suffix={
                    isValidating && (
                      <div className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                    )
                  }
                />
              </Form.Item>

              <Form.Item className="mb-0">
                <Button
                  htmlType="submit"
                  type="primary"
                  size="large"
                  loading={isSubmitting}
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 
                    border-none h-10 text-base font-medium shadow-lg hover:shadow-pink-500/25 transition-all duration-300"
                >
                  <AddCircleOutlineIcon
                    sx={{ width: 20, height: 20 }}
                    className="mr-2"
                  />
                  Save to Favorites
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* Hero Section */}
          <div className="text-center mt-12 py-8">
            <div className="mb-6">
              <div className="relative inline-block group cursor-pointer">
                <div className="absolute inset-0 bg-pink-400/20 rounded-full blur-xl animate-pulse" />
                <BookmarkIcon
                  sx={{ width: 56, height: 56 }}
                  className="text-pink-400 relative z-10 drop-shadow-lg transition-transform duration-300 
                    group-hover:animate-ping"
                />
              </div>
            </div>
            <Title
              level={2}
              className="text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 
                bg-clip-text font-bold tracking-wide"
            >
              Record Your Favorite Links
            </Title>
          </div>
        </div>
      </FavConfigProvider>
    </div>
  );
}
