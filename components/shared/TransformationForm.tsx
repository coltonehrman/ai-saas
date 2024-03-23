"use client";

import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils";
import React, { useEffect, useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  aspectRatioOptions,
  creditFee,
  defaultValues,
  transformationTypes,
} from "@/constants";

import { Button } from "@/components/ui/button";
import { CustomField } from "./CustomField";
import { Form } from "@/components/ui/form";
import { Input } from "../ui/input";
import MediaUploader from "./MediaUploader";
import TransformedImage from "./TransformedImage";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateCredits } from "@/lib/actions/user.actions";
import { getCldImageUrl } from "next-cloudinary";
import { addImage, updateImage } from "@/lib/actions/image.actions";
import { useRouter } from "next/navigation";
import { IImage } from "@/lib/database/models/image.model";
import { InsufficientCreditsModal } from "./InsufficientCreditsModal";

export const formSchema = z.object({
  title: z.string(),
  publicId: z.string(),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
});

const TransformationForm = ({
  type,
  userId,
  action,
  creditBalance,
  data = null,
  config = null,
}: TransformationFormProps) => {
  const [image, setImage] = useState<Partial<IImage>>(data);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranforming, setIsTranforming] = useState(false);
  const [transformationConfig, setTransformationConfig] = useState(config);
  const [newTranformation, setNewTranformation] =
    useState<Transformations | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const transformType = transformationTypes[type];

  const initialValues =
    data && action === "update"
      ? {
          title: data?.title,
          aspectRatio: data?.aspectRatio,
          color: data?.color,
          prompt: data?.prompt,
          publicId: data?.publicId,
        }
      : defaultValues;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    if (data || image) {
      console.log(data, image);
      const transformationUrl = getCldImageUrl({
        width: image?.width,
        height: image?.height,
        src: image?.publicId ?? "",
        ...transformationConfig,
      });

      if (
        !image.publicId ||
        !image.height ||
        !image.width ||
        !image.secureUrl
      ) {
        return;
      }

      const imageData = {
        title: values.title,
        publicId: image.publicId,
        transformationType: type,
        width: image.width,
        height: image.height,
        config: transformationConfig,
        secureUrl: image.secureUrl,
        transformationUrl,
        aspectRatio: values.aspectRatio,
        prompt: values.prompt,
        color: values.color,
      };

      if (action === "add") {
        try {
          const newImage = await addImage({
            image: imageData,
            path: "/",
            userId,
          });

          if (newImage) {
            form.reset();
            setImage(data);
            router.push(`/transformations/${newImage._id}`);
          }
        } catch (e) {
          console.error(e);
        }
      }

      if (action === "update") {
        try {
          const updatedImage = await updateImage({
            image: {
              ...imageData,
              _id: data._id,
            },
            path: `/transformations/${data._id}`,
            userId,
          });

          if (updatedImage) {
            router.push(`/transformations/${updatedImage._id}`);
          }
        } catch (e) {
          console.error(e);
        }
      }

      setIsSubmitting(false);
    }
  }

  const onSelectFieldHandler = (
    value: AspectRatioKey,
    onChangeField: (value: string) => void
  ) => {
    const imageSize = aspectRatioOptions[value];

    setImage((prevState) => ({
      ...prevState,
      aspectRatio: imageSize.aspectRatio as AspectRatioKey,
      width: imageSize.width,
      height: imageSize.height,
    }));

    setNewTranformation(transformType.config);

    return onChangeField(value);
  };

  const onInputChangeHandler = (
    fieldName: string,
    value: string,
    type: string,
    onChangeField: (value: string) => void
  ) => {
    console.log("changing input");
    setNewTranformation((prevState: any) => ({
      ...prevState,
      [type]: {
        ...prevState?.[type],
        [fieldName === "prompt" ? "prompt" : "to"]: value,
      },
    }));

    return onChangeField(value);
  };

  const onTransformHandler = async () => {
    setIsTranforming(true);

    setTransformationConfig(
      deepMergeObjects(newTranformation, transformationConfig)
    );

    setNewTranformation(null);

    startTransition(async () => {
      console.log(userId);
      await updateCredits(userId, creditFee);
    });
  };

  useEffect(() => {
    if (image && (type === "restore" || type === "removeBackground")) {
      setNewTranformation(transformType.config);
    }
  }, [image, transformType.config, type]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {creditBalance < Math.abs(creditFee) && <InsufficientCreditsModal />}

        <CustomField
          control={form.control}
          name="title"
          formLabel="Image Title"
          className="w-full"
          render={({ field }) => <Input {...field} className="input-field" />}
        />

        {type === "fill" && (
          <CustomField
            control={form.control}
            name="aspectRatio"
            formLabel="Aspect Ratio"
            className="w-full"
            render={({ field }) => (
              <Select
                onValueChange={(value) =>
                  onSelectFieldHandler(value as AspectRatioKey, field.onChange)
                }
              >
                <SelectTrigger className="select-field">
                  <SelectValue placeholder="Select aspect ratio" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(aspectRatioOptions) as AspectRatioKey[]).map(
                    (ratio) => (
                      <SelectItem
                        key={ratio}
                        value={aspectRatioOptions[ratio].aspectRatio}
                        className="select-item"
                      >
                        {aspectRatioOptions[ratio].label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            )}
          />
        )}

        {(type === "remove" || type === "recolor") && (
          <div className="prompt-field">
            <CustomField
              control={form.control}
              name="prompt"
              formLabel={
                type === "remove" ? "Object to remove" : "Object to recolor"
              }
              render={({ field }) => (
                <Input
                  value={field.value}
                  className="input-field"
                  onChange={(event) =>
                    onInputChangeHandler(
                      "prompt",
                      event.target.value,
                      type,
                      field.onChange
                    )
                  }
                />
              )}
              className="w-full"
            />
          </div>
        )}

        {type === "recolor" && (
          <CustomField
            control={form.control}
            name="color"
            formLabel="Color replacement"
            className="w-full"
            render={({ field }) => (
              <Input
                value={field.value}
                className="input-field"
                onChange={(event) =>
                  onInputChangeHandler(
                    "color",
                    event.target.value,
                    type,
                    field.onChange
                  )
                }
              />
            )}
          />
        )}

        <div className="media-uploader-field">
          <CustomField
            control={form.control}
            name="publicId"
            className="flex size-full flex-col"
            render={({ field }) => (
              <MediaUploader
                onValueChange={field.onChange}
                setImage={setImage}
                publicId={field.value}
                image={image}
                type={type}
              />
            )}
          />

          <TransformedImage
            title={form.getValues().title}
            image={image}
            type={type}
            isTransforming={isTranforming}
            setIsTransforming={setIsTranforming}
            transformationConfig={transformationConfig}
            hasDownload={false}
          />
        </div>

        <div className="flex flex-col gap-4">
          <Button
            type="button"
            className="submit-button capitalize"
            disabled={isTranforming || newTranformation === null}
            onClick={onTransformHandler}
          >
            {isTranforming ? "Transforming..." : "Apply Transformation"}
          </Button>

          <Button
            type="submit"
            className="submit-button capitalize"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Save Image"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TransformationForm;
