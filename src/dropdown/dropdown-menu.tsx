import { defineComponent, ref, onMounted, h, reactive } from 'vue';
import { ChevronRightIcon as TdChevronRightIcon, ChevronLeftIcon as TdChevronLeftIcon } from 'tdesign-icons-vue-next';
import DropdownItem from './dropdown-item';

import { DropdownOption } from './type';
import DropdownProps from './props';
import TDivider from '../divider';
import { usePrefixClass } from '../hooks/useConfig';
import { useGlobalIcon } from '../hooks/useGlobalIcon';
import { TNode } from '../common';

export default defineComponent({
  name: 'TDropdownMenu',
  props: { ...DropdownProps },
  setup(props) {
    const dropdownClass = usePrefixClass('dropdown');
    const dropdownMenuClass = usePrefixClass('dropdown__menu');
    const scrollTopMap = reactive({});
    const menuRef = ref<HTMLElement>();
    const isOverMaxHeight = ref(false);
    const { ChevronRightIcon, ChevronLeftIcon } = useGlobalIcon({
      ChevronRightIcon: TdChevronRightIcon,
      ChevronLeftIcon: TdChevronLeftIcon,
    });

    const handleItemClick = (options: { data: DropdownOption; context: { e: MouseEvent } }) => {
      const { data, context } = options;
      data?.onClick?.(data, context);
      props.onClick?.(data, context);
    };

    const handleScroll = (e: MouseEvent, deep: number) => {
      const { scrollTop } = e.target as HTMLElement;
      scrollTopMap[deep] = scrollTop;
    };

    onMounted(() => {
      if (menuRef.value) {
        const menuHeight = parseInt(window?.getComputedStyle(menuRef.value).height, 10);
        if (menuHeight >= props.maxHeight) isOverMaxHeight.value = true;
      }
    });

    const getContent = (content: string | TNode) => {
      if (typeof content === 'function') {
        return content(h);
      }
      return content;
    };

    // 处理options渲染的场景
    const renderOptions = (data: Array<DropdownOption>, deep: number) => {
      const arr: Array<unknown> = [];
      let renderContent;
      data.forEach?.((menu, idx) => {
        const optionItem = { ...(menu as DropdownOption) };
        const onViewIdx = idx - Math.ceil(scrollTopMap[deep] / 30);
        const renderIdx = onViewIdx >= 0 ? onViewIdx : idx;

        if (optionItem.children) {
          optionItem.children = renderOptions(optionItem.children, deep + 1);
          renderContent = (
            <div key={idx}>
              <DropdownItem
                style={optionItem.style}
                class={[`${dropdownClass.value}__item`, `${dropdownClass.value}__item--suffix`, optionItem.class]}
                value={optionItem.value}
                theme={optionItem.theme}
                active={optionItem.active}
                prefixIcon={optionItem.prefixIcon}
                disabled={optionItem.disabled}
                minColumnWidth={props.minColumnWidth}
                maxColumnWidth={props.maxColumnWidth}
                isSubmenu={true}
              >
                <div class={`${dropdownClass.value}__item-content`}>
                  {props.direction === 'right' ? (
                    <>
                      <span class={`${dropdownClass.value}__item-text`}>{getContent(optionItem.content)}</span>
                      <ChevronRightIcon class={`${dropdownClass.value}__item-direction`} size="16" />
                    </>
                  ) : (
                    <>
                      <ChevronLeftIcon class={`${dropdownClass.value}__item-direction`} size="16" />
                      <span class={`${dropdownClass.value}__item-text`}>{getContent(optionItem.content)}</span>
                    </>
                  )}
                </div>
                <div
                  class={[
                    `${dropdownClass.value}__submenu-wrapper`,
                    {
                      [`${dropdownClass.value}__submenu-wrapper--${props.direction}`]: props.direction,
                    },
                  ]}
                  style={{
                    position: 'absolute',
                    top: `${renderIdx * 30}px`,
                  }}
                >
                  <div
                    class={[
                      `${dropdownClass.value}__submenu`,
                      {
                        [`${dropdownClass.value}__submenu--disabled`]: optionItem.disabled,
                      },
                    ]}
                    style={{
                      position: 'static',
                      maxHeight: `${props.maxHeight}px`,
                    }}
                    onScroll={(e: MouseEvent) => handleScroll(e, deep + 1)}
                  >
                    <ul>{optionItem.children}</ul>
                  </div>
                </div>
              </DropdownItem>
              {optionItem.divider ? <TDivider /> : null}
            </div>
          );
        } else {
          renderContent = (
            <div key={idx}>
              <DropdownItem
                style={optionItem.style}
                class={[`${dropdownClass.value}__item`, optionItem.class]}
                value={optionItem.value}
                theme={optionItem.theme}
                active={optionItem.active}
                prefixIcon={optionItem.prefixIcon}
                disabled={optionItem.disabled}
                minColumnWidth={props.minColumnWidth}
                maxColumnWidth={props.maxColumnWidth}
                onClick={
                  optionItem.disabled || optionItem.children
                    ? () => null
                    : (value: string | number | { [key: string]: any }, context: { e: MouseEvent }) =>
                        handleItemClick({ data: optionItem, context })
                }
              >
                <span class={`${dropdownClass.value}__item-text`}>{getContent(optionItem.content)}</span>
              </DropdownItem>
              {optionItem.divider ? <TDivider /> : null}
            </div>
          );
        }
        arr.push(renderContent);
      });
      return arr;
    };

    return () => {
      return (
        <div
          class={[
            dropdownMenuClass.value,
            `${dropdownMenuClass.value}--${props.direction}`,
            {
              [`${dropdownMenuClass.value}--overflow`]: isOverMaxHeight.value,
            },
          ]}
          style={{
            maxHeight: `${props.maxHeight}px`,
          }}
          ref={menuRef}
          onScroll={(e: MouseEvent) => handleScroll(e, 0)}
        >
          {renderOptions(props.options, 0)}
        </div>
      );
    };
  },
});
