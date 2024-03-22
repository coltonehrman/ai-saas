"use client";

import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils";
import React, { useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  aspectRatioOptions,
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
  const [image, setImage] = useState<Image>(data);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranforming, setIsTranforming] = useState(false);
  const [transformationConfig, setTransformationConfig] = useState(config);
  const [newTranformation, setNewTranformation] =
    useState<Transformations | null>(null);
  const [isPending, startTransition] = useTransition();

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

  function onSubmit(values: z.infer<typeof formSchema>) {
    
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
    debounce(() => {
      setNewTranformation((prevState: any) => ({
        ...prevState,
        [type]: {
          ...prevState?.[type],
          [fieldName === "prompt" ? "prompt" : "to"]: value,
        },
      }));

      return onChangeField(value);
    }, 1000);
  };

  const onTransformHandler = async () => {
    setIsTranforming(true);

    setTransformationConfig(
      deepMergeObjects(newTranformation, transformationConfig)
    );

    setNewTranformation(null);

    startTransition(async () => {
      // await updateCredits(userId, creditFee)
    });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                    onSelectFieldHandler(
                      value as AspectRatioKey,
                      field.onChange
                    )
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
    </>
  );
};

export default TransformationForm;
