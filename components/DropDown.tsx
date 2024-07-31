import { Menu, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/20/solid";
import { Fragment } from "react";
import { styleType, durationType } from "../utils/dropdownTypes";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface DropDownProps {
  theme: durationType | styleType;
  setTheme: (theme: durationType | styleType) => void;
  themes: durationType[] | styleType[];
}

// TODO: Change names since this is a generic dropdown now
export default function DropDown({ theme, setTheme, themes }: DropDownProps) {
  return (
    <Menu as="div" className="relative block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-between items-center rounded-md border border-transparent bg-[rgba(26,26,26,1.0)] px-4 py-2 text-[rgba(240,240,240,1.0)] shadow-sm hover:bg-[rgba(26,26,26,1.0)] focus:outline-none focus:ring-2 focus:ring-white">
          {theme}
          <ChevronUpIcon
            className="-mr-1 ml-2 h-5 w-5 ui-open:hidden text-[rgba(240,240,240,1.0)]"
            aria-hidden="true"
          />
          <ChevronDownIcon
            className="-mr-1 ml-2 h-5 w-5 hidden ui-open:block text-[rgba(240,240,240,1.0)]"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className="absolute left-0 z-10 mt-2 w-full origin-top-right rounded-md bg-[rgba(26,26,26,1.0)] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden"
          key={theme}
        >
          <div className="">
            {themes.map((themeItem) => (
              <Menu.Item key={themeItem}>
                {({ active }) => (
                  <button
                    onClick={() => setTheme(themeItem)}
                    className={classNames(
                      active ? "bg-[rgba(26,26,26,1.0)] text-[rgba(240,240,240,1.0)]" : "text-[rgba(240,240,240,1.0)]",
                      themeItem === theme ? "bg-[rgba(26,26,26,1.0)]" : "",
                      "px-4 py-2 text-sm w-full text-left flex items-center space-x-2 justify-between"
                    )}
                  >
                    <span>{themeItem}</span>
                    {themeItem === theme ? (
                      <CheckIcon className="w-4 h-4 text-bold text-[rgba(240,240,240,1.0)]" />
                    ) : null}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
