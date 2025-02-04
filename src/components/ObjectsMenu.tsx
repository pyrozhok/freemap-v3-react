import { objectsSetFilter } from 'fm3/actions/objectsActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useEffectiveChosenLanguage } from 'fm3/hooks/useEffectiveChosenLanguage';
import { useScrollClasses } from 'fm3/hooks/useScrollClasses';
import { useMessages } from 'fm3/l10nInjector';
import { getOsmMapping, resolveGenericName } from 'fm3/osm/osmNameResolver';
import { osmTagToIconMapping } from 'fm3/osm/osmTagToIconMapping';
import { Node, OsmMapping } from 'fm3/osm/types';
import { removeAccents } from 'fm3/stringUtils';
import {
  ChangeEvent,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Dropdown, { DropdownProps } from 'react-bootstrap/Dropdown';
import FormControl from 'react-bootstrap/FormControl';
import { useDispatch } from 'react-redux';
import { HideArrow } from './SearchMenu';
import { ToolMenu } from './ToolMenu';

export default ObjectsMenu;

export function ObjectsMenu(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const [filter, setFilter] = useState('');

  const [dropdownOpened, setDropdownOpened] = useState(false);

  const handleFilterSet = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFilter(e.currentTarget.value);
  }, []);

  const lang = useEffectiveChosenLanguage();

  const [osmMapping, setOsmMapping] = useState<OsmMapping>();

  const items = useMemo(() => {
    if (!osmMapping) {
      return;
    }

    const res: { name: string; tags: { key: string; value?: string }[] }[] = [];

    function rec(
      n: Node,
      tags: { key: string; value: string }[],
      key?: string,
    ) {
      for (const [tagKeyOrValue, nodeOrName] of Object.entries(n)) {
        if (nodeOrName === '{}') {
          continue;
        }

        if (typeof nodeOrName === 'string') {
          if (key && tagKeyOrValue === '*') {
            continue;
          }

          res.push({
            name: nodeOrName.replace('{}', '').trim(),
            tags:
              !key && tagKeyOrValue === '*'
                ? tags
                : [
                    ...tags,
                    key
                      ? { key, value: tagKeyOrValue }
                      : { key: tagKeyOrValue },
                  ],
          });
        } else if (key) {
          rec(nodeOrName, [...tags, { key, value: tagKeyOrValue }]);
        } else {
          rec(nodeOrName, tags, tagKeyOrValue);
        }
      }
    }

    rec(osmMapping.osmTagToNameMapping, []);

    return res;
  }, [osmMapping]);

  const active = useAppSelector((state) => state.objects.active);

  useEffect(() => {
    getOsmMapping(lang).then(setOsmMapping);
  }, [lang]);

  const handleSelect = useCallback(
    (tags: string | null) => {
      if (tags) {
        dispatch(
          objectsSetFilter(
            active.includes(tags)
              ? active.filter((item) => item !== tags)
              : [...active, tags],
          ),
        );
      }
    },
    [dispatch, active],
  );

  // ugly hack not to close dropdown on open
  const justOpenedRef = useRef(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleToggle: DropdownProps['onToggle'] = (isOpen, e, metadata) => {
    if (justOpenedRef.current) {
      justOpenedRef.current = false;
    } else if (!isOpen && metadata.source !== 'select') {
      setDropdownOpened(false);

      if (e) {
        e.preventDefault();

        e.stopPropagation();
      }

      inputRef.current?.blur();
    }
  };

  const sc = useScrollClasses('vertical');

  const normalizedFilter = removeAccents(filter.trim().toLowerCase());

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const activeSnapshot = useMemo(() => active, [dropdownOpened]);

  function makeItems(snapshot?: boolean) {
    if (!items) {
      return null;
    }

    return items
      .map((item) => ({
        ...item,
        key: item.tags.map((tag) => `${tag.key}=${tag.value}`).join(','),
      }))
      .filter((item) => !snapshot || activeSnapshot.includes(item.key))
      .filter(
        (item) =>
          snapshot ||
          !normalizedFilter ||
          removeAccents(item.name.toLowerCase()).includes(normalizedFilter),
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(({ key, name, tags }) => {
        const img = resolveGenericName(
          osmTagToIconMapping,
          Object.fromEntries(tags.map(({ key, value }) => [key, value ?? '*'])),
        );

        return (
          <Dropdown.Item key={key} eventKey={key} active={active.includes(key)}>
            {img.length > 0 ? (
              <img src={img[0]} style={{ width: '1em', height: '1em' }} />
            ) : (
              <span
                style={{
                  display: 'inline-block',
                  width: '1em',
                  height: '1em',
                }}
              />
            )}
            &emsp;
            {name}
          </Dropdown.Item>
        );
      });
  }

  const activeItems = makeItems(true);

  return (
    <ToolMenu>
      <Dropdown
        className="ml-1"
        id="objectsMenuDropdown"
        show={dropdownOpened}
        onSelect={handleSelect}
        onToggle={handleToggle}
      >
        <Dropdown.Toggle as={HideArrow}>
          <FormControl
            type="text"
            placeholder={m?.objects.type}
            onChange={handleFilterSet}
            value={filter}
            onFocus={() => {
              justOpenedRef.current = true;

              setDropdownOpened(true);
            }}
            ref={inputRef}
          />
        </Dropdown.Toggle>

        <Dropdown.Menu popperConfig={{ strategy: 'fixed' }}>
          <div className="dropdown-long" ref={sc}>
            <div />

            {/* {poiTypeGroups.map((pointTypeGroup, i) => {
              const gid = pointTypeGroup.id;

              const items = poiTypes
                .filter(({ group }) => group === gid)
                .filter(({ id }) =>
                  m?.objects.subcategories[id]
                    ?.toLowerCase()
                    .includes(filter.toLowerCase()),
                )
                .map(({ group, id, icon }) => (
                  <Dropdown.Item key={id} eventKey={String(id)}>
                    <img
                      src={require(`../images/mapIcons/${icon}.png`)}
                      alt={`${group}-${icon}`}
                    />{' '}
                    {m?.objects.subcategories[id]}
                  </Dropdown.Item>
                ));

              return items.length === 0 ? null : (
                <Fragment key={gid}>
                  {i > 0 && <Dropdown.Divider />}
                  <Dropdown.Header>
                    {m?.objects.categories[gid]}
                  </Dropdown.Header>
                  {items}
                </Fragment>
              );
            })} */}

            {activeItems}

            {activeItems?.length ? <Dropdown.Divider /> : null}

            {makeItems()}
          </div>
        </Dropdown.Menu>
      </Dropdown>
    </ToolMenu>
  );
}
