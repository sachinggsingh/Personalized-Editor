'use client';

import React from 'react';
import { IoLogoJavascript } from "react-icons/io";
import { SiPython } from "react-icons/si";
import { FaJava } from "react-icons/fa";
import { TbBrandCpp } from "react-icons/tb";
import { SiC } from "react-icons/si";


export interface LanguageIconProps {
  className?: string;
  size?: number | string;
}

export const TypeScriptIcon: React.FC<LanguageIconProps> = ({ className, size = 24 }) => (
  <IoLogoJavascript className={className} size={size} />
);

export const PythonIcon: React.FC<LanguageIconProps> = ({ className, size = 24 }) => (
  <SiPython className={className} size={size} />
);

export const JavaIcon: React.FC<LanguageIconProps> = ({ className, size = 24 }) => (
  < FaJava className={className} size={size} />
);

export const CppIcon: React.FC<LanguageIconProps> = ({ className, size = 24 }) => (
  <TbBrandCpp className={className} size={size} />
);

export const CIcon: React.FC<LanguageIconProps> = ({ className, size = 24 }) => (
  <SiC className={className} size={size} />
);
